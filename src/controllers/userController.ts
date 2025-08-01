import { Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';
import { NotFoundError } from '@/middleware/errorHandler';
import { AuthenticatedRequest } from '@/middleware/auth';
import { UserService } from '@/services/UserService';
import { logger } from '@/utils/logger';

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  private sanitizeUser(user: any) {
    const { ...sanitizedUser } = user;
    return sanitizedUser;
  }

  public getUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { page = 1, limit = 10, role, isActive } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const filters = {
      role: role as string,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      limit: Number(limit),
      offset,
    };

    const { users, total } = await this.userService.findAll(filters);
    
    const totalPages = Math.ceil(total / Number(limit));
    const currentPage = Number(page);

    res.json({
      success: true,
      data: users.map(user => this.sanitizeUser(user)),
      pagination: {
        page: currentPage,
        limit: Number(limit),
        total,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrevious: currentPage > 1,
      },
    });
  });

  public getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    
    // Users can only view their own profile unless they're admin
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      throw new NotFoundError('User not found');
    }

    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.json({
      success: true,
      data: this.sanitizeUser(user),
    });
  });

  public updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user?.role !== 'admin' && req.user?.id !== id) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await this.userService.update(id, updateData);

    logger.info('User updated', { 
      userId: id, 
      updatedBy: req.user?.id,
      updatedFields: Object.keys(updateData)
    });

    res.json({
      success: true,
      data: this.sanitizeUser(updatedUser),
      message: 'User updated successfully',
    });
  });

  public deactivateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    await this.userService.deactivate(id);

    logger.info('User deactivated', { 
      userId: id, 
      deactivatedBy: req.user?.id 
    });

    res.json({
      success: true,
      message: 'User deactivated successfully',
    });
  });

  public deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;

    // Prevent admins from deleting themselves
    if (req.user?.id === id) {
      throw new NotFoundError('Cannot delete your own account');
    }

    await this.userService.delete(id);

    logger.info('User deleted', { 
      userId: id, 
      deletedBy: req.user?.id 
    });

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  });
}

export const userController = new UserController();
export default userController;