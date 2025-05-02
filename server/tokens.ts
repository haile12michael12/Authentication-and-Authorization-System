import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { storage } from './storage';
import * as schema from '@shared/schema';

// Default token settings
const DEFAULT_ACCESS_TOKEN_EXPIRATION = 30 * 60; // 30 minutes in seconds
const DEFAULT_REFRESH_TOKEN_EXPIRATION = 7 * 24 * 60 * 60; // 7 days in seconds

// Secret keys should be loaded from environment variables
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret_key_should_be_set_in_env';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key_should_be_set_in_env';

// Token payload types
interface AccessTokenPayload {
  userId: number;
  username: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  userId: number;
  tokenId: string;
}

export class TokenService {
  private accessTokenExpiration: number;
  private refreshTokenExpiration: number;
  private rotateOnUse: boolean;

  constructor() {
    this.accessTokenExpiration = DEFAULT_ACCESS_TOKEN_EXPIRATION;
    this.refreshTokenExpiration = DEFAULT_REFRESH_TOKEN_EXPIRATION;
    this.rotateOnUse = true;
  }

  // Update token settings
  updateSettings(settings: schema.TokenSettings): void {
    this.accessTokenExpiration = settings.accessTokenExpiration;
    this.refreshTokenExpiration = settings.refreshTokenExpiration;
    this.rotateOnUse = settings.rotateOnUse;
  }

  // Get current token settings
  getSettings(): schema.TokenSettings {
    return {
      accessTokenExpiration: this.accessTokenExpiration,
      refreshTokenExpiration: this.refreshTokenExpiration,
      rotateOnUse: this.rotateOnUse
    };
  }

  // Generate access token
  generateAccessToken(user: schema.User): string {
    const payload: AccessTokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: this.accessTokenExpiration
    });
  }

  // Generate refresh token
  async generateRefreshToken(user: schema.User, userAgent?: string, ipAddress?: string): Promise<string> {
    // Generate a cryptographically secure random token ID
    const tokenId = randomBytes(40).toString('hex');
    
    // Create JWT payload
    const payload: RefreshTokenPayload = {
      userId: user.id,
      tokenId
    };
    
    // Sign the token
    const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: this.refreshTokenExpiration
    });
    
    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + this.refreshTokenExpiration);
    
    // Store refresh token in database
    await storage.createSession({
      userId: user.id,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt
    });
    
    return refreshToken;
  }

  // Verify access token
  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      return jwt.verify(token, REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
    } catch (error) {
      return null;
    }
  }

  // Refresh tokens - validates refresh token and issues new access token (and optionally new refresh token)
  async refreshTokens(refreshToken: string, userAgent?: string, ipAddress?: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    // Verify JWT signature and expiration
    const payload = this.verifyRefreshToken(refreshToken);
    if (!payload) return null;
    
    // Check if token exists in database and is not revoked
    const session = await storage.getSessionByToken(refreshToken);
    if (!session) return null;
    
    // Get user
    const user = await storage.getUser(payload.userId);
    if (!user) return null;
    
    // Generate new access token
    const accessToken = this.generateAccessToken(user);
    
    // If token rotation is enabled, create a new refresh token and revoke the old one
    if (this.rotateOnUse) {
      const newRefreshToken = await this.generateRefreshToken(user, userAgent, ipAddress);
      await storage.revokeSession(refreshToken, newRefreshToken);
      return { accessToken, refreshToken: newRefreshToken };
    }
    
    // If token rotation is not enabled, return the same refresh token
    return { accessToken, refreshToken };
  }

  // Revoke a refresh token
  async revokeToken(token: string): Promise<boolean> {
    await storage.revokeSession(token);
    return true;
  }

  // Revoke all refresh tokens for a user
  async revokeAllUserTokens(userId: number): Promise<boolean> {
    await storage.revokeAllUserSessions(userId);
    return true;
  }
}

// Singleton instance
export const tokenService = new TokenService();
