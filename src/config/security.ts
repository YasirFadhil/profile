// Security configuration for the portfolio website

/**
 * Content Security Policy (CSP) Headers
 * Helps prevent XSS, clickjacking, and other injection attacks
 */
export const CSP_HEADERS = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
  "style-src": ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com", "fonts.googleapis.com"],
  "img-src": ["'self'", "data:", "https:"],
  "font-src": ["'self'", "cdnjs.cloudflare.com", "fonts.gstatic.com"],
  "connect-src": ["'self'", "formspree.io"],
  "frame-ancestors": ["'self'"],
  "base-uri": ["'self'"],
  "form-action": ["'self'", "formspree.io"],
};

/**
 * Security Headers to set in responses
 */
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

/**
 * Email validation regex
 * Validates basic email format
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Input validation rules
 */
export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: "Name should contain only letters, spaces, hyphens, and apostrophes",
  },
  email: {
    minLength: 5,
    maxLength: 254,
    pattern: EMAIL_REGEX,
    message: "Please enter a valid email address",
  },
  subject: {
    minLength: 3,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s.,!?'-]+$/,
    message: "Subject contains invalid characters",
  },
  message: {
    minLength: 10,
    maxLength: 5000,
    message: "Message must be between 10 and 5000 characters",
  },
};

/**
 * Rate limiting configuration
 * Prevents spam and abuse
 */
export const RATE_LIMIT_CONFIG = {
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests, please try again later",
};

/**
 * Sanitize user input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, 5000); // Limit input size
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length <= 254;
}

/**
 * Validate name format
 */
export function isValidName(name: string): boolean {
  const rule = VALIDATION_RULES.name;
  return (
    name.length >= rule.minLength &&
    name.length <= rule.maxLength &&
    rule.pattern.test(name)
  );
}

/**
 * Validate subject format
 */
export function isValidSubject(subject: string): boolean {
  const rule = VALIDATION_RULES.subject;
  return (
    subject.length >= rule.minLength &&
    subject.length <= rule.maxLength &&
    rule.pattern.test(subject)
  );
}

/**
 * Validate message format
 */
export function isValidMessage(message: string): boolean {
  const rule = VALIDATION_RULES.message;
  return (
    message.length >= rule.minLength &&
    message.length <= rule.maxLength
  );
}

/**
 * Validate all contact form fields
 */
export function validateContactForm(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!isValidName(data.name)) {
    errors.name = VALIDATION_RULES.name.message;
  }

  if (!isValidEmail(data.email)) {
    errors.email = VALIDATION_RULES.email.message;
  }

  if (!isValidSubject(data.subject)) {
    errors.subject = VALIDATION_RULES.subject.message;
  }

  if (!isValidMessage(data.message)) {
    errors.message = VALIDATION_RULES.message.message;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
