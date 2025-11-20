import { Request, Response, NextFunction } from "express";
import { sanitizeObject } from "../lib/utils";

/**
 * Centralized error handler middleware
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    statusCode = 500;
    message = 'Something went wrong';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * Validate required fields in request body
 */
export const validateRequiredFields = (requiredFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = requiredFields.filter((field) => !req.body[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number format (basic)
 */
export const validatePhone = (phone: string): boolean => {
  // Basic validation: should contain only digits, spaces, and common phone chars
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 9;
};

/**
 * Validate payment amount
 */
export const validateAmount = (amount: any): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

/**
 * Sanitize string input (basic XSS prevention)
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/[<>]/g, "")
    .trim()
    .substring(0, 500); // Limit length
};

/**
 * Validate request body for booking creation
 */
export const validateBookingData = (req: Request, res: Response, next: NextFunction) => {
  const { homeowner_id, booking_date, service_type, amount } = req.body;

  const errors: string[] = [];

  if (!homeowner_id) errors.push("homeowner_id is required");
  if (!booking_date) errors.push("booking_date is required");
  if (!service_type) errors.push("service_type is required");

  if (amount !== undefined && !validateAmount(amount)) {
    errors.push("amount must be a positive number");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join("; "),
      received_fields: Object.keys(req.body),
    });
  }

  next();
};

/**
 * Validate request body for payment creation
 */
export const validatePaymentData = (req: Request, res: Response, next: NextFunction) => {
  const { booking_id, amount, payment_method } = req.body;

  const errors: string[] = [];

  if (!booking_id) errors.push("booking_id is required");
  if (!amount || !validateAmount(amount)) errors.push("amount must be a positive number");
  if (!payment_method) errors.push("payment_method is required");
  if (payment_method && !["flutterwave", "bank_transfer", "cash"].includes(payment_method)) {
    errors.push("payment_method must be one of: flutterwave, bank_transfer, cash");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join("; "),
      received_fields: Object.keys(req.body),
    });
  }

  next();
};

/**
 * Validate request body for training creation
 */
export const validateTrainingData = (req: Request, res: Response, next: NextFunction) => {
  const { title, instructor } = req.body;

  const errors: string[] = [];

  if (!title) errors.push("title is required");
  if (!instructor) errors.push("instructor is required");

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join("; "),
    });
  }

  next();
};

/**
 * Validate UUID format
 */
export const validateUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * 🔐 Additional Security Fixes
 *
 * ### 9. **Input Validation Issues**
 * Issue**: Missing input sanitization in several API endpoints.
 *
 * **Fix**: Add validation middleware:
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};