import { Request, Response, NextFunction } from "express";

/**
 * Convert a camelCase string to snake_case
 */
const camelToSnake = (str: string): string => {
  return str
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, "");
};

/**
 * Recursively convert object keys from camelCase to snake_case
 */
export const convertKeysToSnakeCase = (
  obj: any,
): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => convertKeysToSnakeCase(item));
  }

  if (typeof obj !== "object") {
    return obj;
  }

  const newObj: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    newObj[snakeKey] = convertKeysToSnakeCase(value);
  }

  return newObj;
};

/**
 * Middleware to normalize request body from camelCase to snake_case
 * Stores original in req.body for reference if needed
 */
export const normalizeRequestBody = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  // Only process POST, PUT, PATCH requests with JSON body
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body) {
    req.body = convertKeysToSnakeCase(req.body);
  }

  next();
};

export default normalizeRequestBody;
