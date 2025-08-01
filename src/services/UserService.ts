import { db } from '@/config/database';
import { NotFoundError, ConflictError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: Date;
  role: 'user' | 'agent' | 'admin';
  permissions?: string[];
  isActive: boolean;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  refreshToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetTokenExpiry?: Date | null;
  emailVerificationToken?: string | null;
  emailVerificationTokenExpiry?: Date | null;
  address?: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: Date;
  role?: 'user' | 'agent' | 'admin';
  permissions?: string[];
  isActive?: boolean;
  address?: any;
  metadata?: any;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: any;
  metadata?: any;
}

export class UserService {
  private table = 'users';

  // Convert database row to User object (camelCase)
  private mapRowToUser(row: any): User {
    if (!row) return row;
    
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      password: row.password,
      phone: row.phone,
      dateOfBirth: row.date_of_birth,
      role: row.role,
      permissions: row.permissions,
      isActive: row.is_active,
      emailVerified: row.email_verified,
      emailVerifiedAt: row.email_verified_at,
      lastLoginAt: row.last_login_at,
      refreshToken: row.refresh_token,
      passwordResetToken: row.password_reset_token,
      passwordResetTokenExpiry: row.password_reset_token_expiry,
      emailVerificationToken: row.email_verification_token,
      emailVerificationTokenExpiry: row.email_verification_token_expiry,
      address: row.address,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // Convert User object to database row (snake_case)
  private mapUserToRow(user: CreateUserData | UpdateUserData): any {
    const row: any = {};
    
    if ('firstName' in user) row.first_name = user.firstName;
    if ('lastName' in user) row.last_name = user.lastName;
    if ('email' in user) row.email = user.email;
    if ('password' in user) row.password = user.password;
    if ('phone' in user) row.phone = user.phone;
    if ('dateOfBirth' in user) row.date_of_birth = user.dateOfBirth;
    if ('role' in user) row.role = user.role;
    if ('permissions' in user) row.permissions = user.permissions;
    if ('isActive' in user) row.is_active = user.isActive;
    if ('address' in user) row.address = user.address;
    if ('metadata' in user) row.metadata = user.metadata;
    
    return row;
  }

  async create(userData: CreateUserData): Promise<User> {
    try {
      const row = this.mapUserToRow(userData);
      const [createdUser] = await db(this.table)
        .insert(row)
        .returning('*');
      
      logger.info('User created', { userId: createdUser.id, email: createdUser.email });
      return this.mapRowToUser(createdUser);
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'users_email_unique') {
        throw new ConflictError('User already exists with this email');
      }
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    const user = await db(this.table)
      .where('id', id)
      .first();
    
    return user ? this.mapRowToUser(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await db(this.table)
      .where('email', email.toLowerCase())
      .first();
    
    return user ? this.mapRowToUser(user) : null;
  }

  async findByPasswordResetToken(token: string): Promise<User | null> {
    const user = await db(this.table)
      .where('password_reset_token', token)
      .first();
    
    return user ? this.mapRowToUser(user) : null;
  }

  async findAll(filters: { 
    role?: string; 
    isActive?: boolean; 
    limit?: number; 
    offset?: number; 
  } = {}): Promise<{ users: User[]; total: number }> {
    let query = db(this.table);
    let countQuery = db(this.table);

    if (filters.role) {
      query = query.where('role', filters.role);
      countQuery = countQuery.where('role', filters.role);
    }

    if (filters.isActive !== undefined) {
      query = query.where('is_active', filters.isActive);
      countQuery = countQuery.where('is_active', filters.isActive);
    }

    // Get total count
    const [{ count }] = await countQuery.count('* as count');

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }

    // Order by creation date
    query = query.orderBy('created_at', 'desc');

    const users = await query;
    
    return {
      users: users.map(user => this.mapRowToUser(user)),
      total: parseInt(count as string, 10),
    };
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    const row = this.mapUserToRow(userData);
    
    const [updatedUser] = await db(this.table)
      .where('id', id)
      .update({ ...row, updated_at: new Date() })
      .returning('*');

    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    logger.info('User updated', { userId: id });
    return this.mapRowToUser(updatedUser);
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const updated = await db(this.table)
      .where('id', id)
      .update({
        password: hashedPassword,
        updated_at: new Date(),
      });

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    logger.info('User password updated', { userId: id });
  }

  async updateRefreshToken(id: string, refreshToken: string | null): Promise<void> {
    const updated = await db(this.table)
      .where('id', id)
      .update({
        refresh_token: refreshToken,
        updated_at: new Date(),
      });

    if (!updated) {
      throw new NotFoundError('User not found');
    }
  }

  async updateLastLogin(id: string): Promise<void> {
    await db(this.table)
      .where('id', id)
      .update({
        last_login_at: new Date(),
        updated_at: new Date(),
      });
  }

  async updatePasswordResetToken(
    id: string, 
    token: string | null, 
    expiry: Date | null
  ): Promise<void> {
    const updated = await db(this.table)
      .where('id', id)
      .update({
        password_reset_token: token,
        password_reset_token_expiry: expiry,
        updated_at: new Date(),
      });

    if (!updated) {
      throw new NotFoundError('User not found');
    }
  }

  async updateEmailVerification(
    id: string,
    verified: boolean,
    token: string | null = null,
    expiry: Date | null = null
  ): Promise<void> {
    const updated = await db(this.table)
      .where('id', id)
      .update({
        email_verified: verified,
        email_verified_at: verified ? new Date() : null,
        email_verification_token: token,
        email_verification_token_expiry: expiry,
        updated_at: new Date(),
      });

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    logger.info('User email verification updated', { userId: id, verified });
  }

  async deactivate(id: string): Promise<void> {
    const updated = await db(this.table)
      .where('id', id)
      .update({
        is_active: false,
        refresh_token: null,
        updated_at: new Date(),
      });

    if (!updated) {
      throw new NotFoundError('User not found');
    }

    logger.info('User deactivated', { userId: id });
  }

  async delete(id: string): Promise<void> {
    const deleted = await db(this.table)
      .where('id', id)
      .del();

    if (!deleted) {
      throw new NotFoundError('User not found');
    }

    logger.info('User deleted', { userId: id });
  }
}

export default UserService;