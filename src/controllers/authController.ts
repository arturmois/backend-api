import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '@/middleware/errorHandler';
import { ValidationError, UnauthorizedError, ConflictError, NotFoundError } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';
import { UserService } from '@/services/UserService';
import { logger } from '@/utils/logger';

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  private generateTokens(user: any): TokenPair {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    };

    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { id: user.id, tokenId: uuidv4() },
      jwtSecret,
      { expiresIn: '7d' } as jwt.SignOptions
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    };
  }

  private sanitizeUser(user: any) {
    const { password, refreshToken, ...sanitizedUser } = user;
    return sanitizedUser;
  }

  public register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, email, password, phone, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User already exists with this email');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role,
      isActive: true,
    };

    const user = await this.userService.create(userData);
    const tokens = this.generateTokens(user);

    // Store refresh token (in a real app, you'd store this securely)
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    res.status(201).json({
      success: true,
      data: {
        user: this.sanitizeUser(user),
        tokens,
      },
      message: 'User registered successfully',
    });
  });

  public login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, rememberMe } = req.body;

    // Find user by email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedError('Account is disabled. Please contact support.');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Store refresh token
    await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

    // Update last login
    await this.userService.updateLastLogin(user.id);

    logger.info('User logged in successfully', { userId: user.id, email: user.email });

    res.json({
      success: true,
      data: {
        user: this.sanitizeUser(user),
        tokens,
      },
      message: 'Login successful',
    });
  });

  public refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET is not configured');
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, jwtSecret) as any;
      
      // Find user and verify refresh token
      const user = await this.userService.findById(decoded.id);
      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Store new refresh token
      await this.userService.updateRefreshToken(user.id, tokens.refreshToken);

      res.json({
        success: true,
        data: {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn,
        },
        message: 'Token refreshed successfully',
      });
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  });

  public logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Clear refresh token
    await this.userService.updateRefreshToken(req.user.id, null);

    logger.info('User logged out successfully', { userId: req.user.id });

    res.json({
      success: true,
      message: 'Logout successful',
    });
  });

  public getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const user = await this.userService.findById(req.user.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: this.sanitizeUser(user),
    });
  });

  public forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    const user = await this.userService.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not
      res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      });
      return;
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.userService.updatePasswordResetToken(user.id, resetToken, resetTokenExpiry);

    // TODO: Send email with reset link
    logger.info('Password reset requested', { userId: user.id, email: user.email });

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent.',
    });
  });

  public resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token, password } = req.body;

    const user = await this.userService.findByPasswordResetToken(token);
    if (!user || !user.passwordResetTokenExpiry || user.passwordResetTokenExpiry < new Date()) {
      throw new ValidationError('Invalid or expired reset token');
    }

    // Hash new password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update password and clear reset token
    await this.userService.updatePassword(user.id, hashedPassword);
    await this.userService.updatePasswordResetToken(user.id, null, null);

    logger.info('Password reset successfully', { userId: user.id });

    res.json({
      success: true,
      message: 'Password reset successfully',
    });
  });
}

export const authController = new AuthController();
export default authController;