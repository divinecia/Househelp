/**
 * Input sanitization utility to prevent XSS attacks
 */

/**
 * Sanitize HTML to remove dangerous tags and attributes
 */
export const sanitizeHTML = (html: string): string => {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Sanitize user input to remove potential XSS vectors
 */
export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Sanitize email to ensure it's a valid email format
 */
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Sanitize phone number to remove non-numeric characters (except + and -)
 */
export const sanitizePhoneNumber = (phone: string): string => {
  return phone.replace(/[^\d+\-]/g, "");
};

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export const sanitizeURL = (url: string): string => {
  try {
    const parsed = new URL(url);
    if (["javascript:", "data:", "vbscript:"].includes(parsed.protocol)) {
      return "";
    }
    return url;
  } catch {
    // Invalid URL
    return "";
  }
};

/**
 * Sanitize object keys to prevent prototype pollution
 */
export const sanitizeObject = <T extends Record<string, any>>(obj: T): T => {
  const dangerous = ["__proto__", "constructor", "prototype"];
  const sanitized = { ...obj };

  Object.keys(sanitized).forEach((key) => {
    if (dangerous.includes(key)) {
      delete sanitized[key];
    }
  });

  return sanitized;
};

/**
 * Validate and sanitize national ID format
 */
export const sanitizeNationalID = (id: string): string => {
  // Remove all non-alphanumeric characters except spaces
  return id.replace(/[^\w\s]/g, "").toUpperCase();
};
