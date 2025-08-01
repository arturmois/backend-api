import { Request, Response, NextFunction } from 'express';

export const validationErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Handle OpenAPI validation errors
  if (error.status === 400 && error.errors) {
    const validationErrors = error.errors.map((err: any) => ({
      field: err.path,
      message: err.message,
      value: err.errorCode,
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Validation Error',
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        details: {
          errors: validationErrors,
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }

  // Handle Joi validation errors
  if (error.isJoi) {
    const validationErrors = error.details.map((detail: any) => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value,
    }));

    res.status(400).json({
      success: false,
      error: {
        message: 'Validation Error',
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        details: {
          errors: validationErrors,
        },
        timestamp: new Date().toISOString(),
        path: req.path,
      },
    });
  }

  // Pass to next error handler if not a validation error
  next(error);
};

export default validationErrorHandler;