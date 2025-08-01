import Joi from 'joi';

const phonePattern = /^\+?[1-9]\d{1,14}$/;

export const updateUserSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'First name must be at least 2 characters long',
      'string.max': 'First name cannot exceed 50 characters',
    }),

  lastName: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Last name must be at least 2 characters long',
      'string.max': 'Last name cannot exceed 50 characters',
    }),

  phone: Joi.string()
    .pattern(phonePattern)
    .optional()
    .allow(null, '')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),

  dateOfBirth: Joi.date()
    .max('now')
    .optional()
    .messages({
      'date.max': 'Date of birth cannot be in the future',
    }),

  address: Joi.object({
    street: Joi.string().max(255).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(100).optional(),
    zipCode: Joi.string().max(20).optional(),
    country: Joi.string().max(100).optional(),
  }).optional(),

  metadata: Joi.object().optional(),
});

export const getUsersQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional(),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .optional(),

  role: Joi.string()
    .valid('user', 'agent', 'admin')
    .optional(),

  isActive: Joi.boolean()
    .optional(),

  sort: Joi.string()
    .pattern(/^[a-zA-Z_][a-zA-Z0-9_]*:(asc|desc)$/)
    .optional()
    .messages({
      'string.pattern.base': 'Sort parameter must be in format "field:direction" (e.g., "createdAt:desc")',
    }),
});

export const userIdParamSchema = Joi.object({
  id: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.uuid': 'Invalid user ID format',
      'string.empty': 'User ID is required',
    }),
});

export default {
  updateUserSchema,
  getUsersQuerySchema,
  userIdParamSchema,
};