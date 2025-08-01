import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logRequest } from '@/utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Generate unique request ID
  const requestId = req.headers['x-request-id'] as string || uuidv4();
  
  // Add request ID to request object for use in other middleware
  (req as any).requestId = requestId;
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', requestId);

  // Record start time
  const startTime = Date.now();

  // Override res.end to log the request after response is sent
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): any {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log the request
    logRequest(req, res, responseTime);
    
    // Call the original end method
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

export default requestLogger;