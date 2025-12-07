import { Request, Response, NextFunction } from "express";

/**
 * Middleware to normalize request body from camelCase to snake_case
 * This helps maintain consistency with database column names
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function normalizeObject(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(normalizeObject);
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const normalized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const snakeKey = toSnakeCase(key);
        normalized[snakeKey] = normalizeObject(obj[key]);
      }
    }
    return normalized;
  }

  return obj;
}

export default function normalizeRequestBody(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (req.body && typeof req.body === 'object') {
    req.body = normalizeObject(req.body);
  }
  next();
}
