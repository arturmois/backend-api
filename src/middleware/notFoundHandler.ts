import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '@/middleware/errorHandler';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`);
  next(error);
};

export default notFoundHandler;