import { Request, Response, NextFunction } from 'express';
import { tokenService } from './tokens';
import { storage } from './storage';
import { UserRole } from '@shared/schema';

// Extend Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

// Extract JWT from Authorization header
export function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7); // Remove 'Bearer ' prefix
}

// Authentication middleware
export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);
  
  if (!token) {
    return res.status(401).json({ message: 'No authentication token provided' });
  }
  
  const payload = tokenService.verifyAccessToken(token);
  
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  // Attach user info to request
  req.user = payload;
  req.token = token;
  
  next();
}

// Role-based authorization middleware factory
export function authorize(allowedRoles: UserRole[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    // First ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // If no specific roles are required, or user has one of the allowed roles
    if (allowedRoles.length === 0 || allowedRoles.includes(req.user.role as UserRole)) {
      return next();
    }
    
    // User doesn't have required role
    return res.status(403).json({ message: 'Insufficient permissions' });
  };
}

// Log authentication events
export async function logAuthEvent(
  userId: number | null,
  action: string,
  status: string,
  req: Request,
  details?: string
) {
  try {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    
    await storage.createAuthLog({
      userId: userId,
      action,
      status,
      userAgent: userAgent || 'Unknown',
      ipAddress: ipAddress || 'Unknown',
      details
    });
  } catch (error) {
    console.error('Error logging auth event:', error);
  }
}

// Rate limiting middleware for login attempts
const loginAttempts = new Map<string, { count: number, resetTime: number }>();

export function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  // Get existing attempts record or create a new one
  const record = loginAttempts.get(ip) || { count: 0, resetTime: now + 60 * 60 * 1000 }; // 1 hour window
  
  // Check if window has expired and reset if needed
  if (record.resetTime < now) {
    record.count = 0;
    record.resetTime = now + 60 * 60 * 1000;
  }
  
  // Check if too many attempts
  if (record.count >= 5) { // Max 5 attempts per hour
    return res.status(429).json({
      message: 'Too many login attempts, please try again later',
      retryAfter: Math.ceil((record.resetTime - now) / 1000) // seconds until reset
    });
  }
  
  // Update attempts counter
  record.count += 1;
  loginAttempts.set(ip, record);
  
  next();
}
