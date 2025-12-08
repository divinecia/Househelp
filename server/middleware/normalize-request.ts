import { Request, Response, NextFunction } from "express";

/**
 * Middleware to normalize request body from camelCase to snake_case
 * This helps maintain consistency with database column names
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function normalizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (Array.isArray(obj)) {
    return obj.map(normalizeObject);
  }

  if (typeof obj === "object" && obj.constructor === Object) {
    const normalized: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = toSnakeCase(key);
        normalized[snakeKey] = normalizeObject((obj as Record<string, unknown>)[key]);
      }
    }
    return normalized;
  }

  return obj;
}

export default function normalizeRequestBody(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.body && typeof req.body === "object") {
    const originalBody = req.body;
    req.body = normalizeObject(req.body);

    // Log normalization for auth endpoints
    if (req.path === "/register" || req.path === "/login") {
      console.log("Request normalization:", {
        original: Object.keys(originalBody),
        normalized: Object.keys(req.body),
      });
    }
  }
  next();
}
