import { Request, Response, NextFunction } from 'express';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { Express } from 'express';
import { z } from 'zod';
import { storage } from './storage';
import { tokenService } from './tokens';
import { authenticate, authorize, logAuthEvent, loginRateLimiter } from './middleware';
import * as schema from '@shared/schema';

const scryptAsync = promisify(scrypt);

// Password hashing function
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Password verification function
async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Initialize authentication routes
export function setupAuth(app: Express) {
  // Register new user
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      // Validate input
      const validatedData = schema.insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      
      // Hash password
      const hashedPassword = await hashPassword(validatedData.password);
      
      // Create user
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });
      
      // Generate tokens
      const accessToken = tokenService.generateAccessToken(user);
      const refreshToken = await tokenService.generateRefreshToken(
        user,
        req.headers['user-agent'],
        req.ip
      );
      
      // Log successful registration
      await logAuthEvent(user.id, 'register', 'success', req);
      
      // Return user data and tokens
      return res.status(201).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      await logAuthEvent(null, 'register', 'failure', req, (error as Error).message);
      return res.status(500).json({ message: 'Error registering user' });
    }
  });
  
  // Login user
  app.post('/api/login', loginRateLimiter, async (req: Request, res: Response) => {
    try {
      // Validate login credentials
      const { username, password } = schema.loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(username);
      
      // Check if user exists and password is correct
      if (!user || !(await comparePasswords(password, user.password))) {
        await logAuthEvent(
          user?.id || null, 
          'login', 
          'failure', 
          req, 
          'Invalid username or password'
        );
        return res.status(401).json({ message: 'Invalid username or password' });
      }
      
      // Check if user account is active
      if (user.status !== 'active') {
        await logAuthEvent(user.id, 'login', 'failure', req, `Account ${user.status}`);
        return res.status(403).json({ message: `Your account is ${user.status}` });
      }
      
      // Generate tokens
      const accessToken = tokenService.generateAccessToken(user);
      const refreshToken = await tokenService.generateRefreshToken(
        user,
        req.headers['user-agent'],
        req.ip
      );
      
      // Update last login time
      await storage.updateUserLastLogin(user.id);
      
      // Log successful login
      await logAuthEvent(user.id, 'login', 'success', req);
      
      // Return user data and tokens
      return res.status(200).json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      await logAuthEvent(null, 'login', 'failure', req, (error as Error).message);
      return res.status(500).json({ message: 'Error during login' });
    }
  });
  
  // Refresh tokens
  app.post('/api/refresh-token', async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }
      
      // Verify and refresh tokens
      const tokens = await tokenService.refreshTokens(
        refreshToken,
        req.headers['user-agent'],
        req.ip
      );
      
      if (!tokens) {
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
      }
      
      // Log token refresh
      const payload = tokenService.verifyRefreshToken(refreshToken);
      if (payload) {
        await logAuthEvent(payload.userId, 'token_refresh', 'success', req);
      }
      
      return res.json(tokens);
    } catch (error) {
      console.error('Token refresh error:', error);
      return res.status(500).json({ message: 'Error refreshing token' });
    }
  });
  
  // Logout
  app.post('/api/logout', async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token is required' });
      }
      
      // Verify token to get user ID for logging
      const payload = tokenService.verifyRefreshToken(refreshToken);
      
      // Revoke the token
      await tokenService.revokeToken(refreshToken);
      
      // Log logout
      if (payload) {
        await logAuthEvent(payload.userId, 'logout', 'success', req);
      }
      
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ message: 'Error during logout' });
    }
  });
  
  // Revoke all sessions
  app.post('/api/revoke-all-sessions', authenticate, async (req: Request, res: Response) => {
    try {
      await tokenService.revokeAllUserTokens(req.user.userId);
      
      await logAuthEvent(req.user.userId, 'revoke_all_sessions', 'success', req);
      
      return res.status(200).json({ message: 'All sessions revoked successfully' });
    } catch (error) {
      console.error('Session revocation error:', error);
      return res.status(500).json({ message: 'Error revoking sessions' });
    }
  });
  
  // Get current user
  app.get('/api/user', authenticate, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        lastLogin: user.lastLogin
      });
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({ message: 'Error fetching user data' });
    }
  });
  
  // Update token settings (admin only)
  app.post('/api/token-settings', authenticate, authorize([schema.UserRole.ADMIN]), async (req: Request, res: Response) => {
    try {
      const settings = schema.tokenSettingsSchema.parse(req.body);
      
      tokenService.updateSettings(settings);
      
      return res.json({ message: 'Token settings updated', settings: tokenService.getSettings() });
    } catch (error) {
      console.error('Token settings error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: 'Validation error', 
          errors: error.errors 
        });
      }
      
      return res.status(500).json({ message: 'Error updating token settings' });
    }
  });
  
  // Get token settings
  app.get('/api/token-settings', authenticate, authorize([schema.UserRole.ADMIN]), (req: Request, res: Response) => {
    return res.json(tokenService.getSettings());
  });
}
