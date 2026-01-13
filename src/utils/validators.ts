// Validators
// Form and data validation utilities

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; message: string } {
  if (password.length < 6) {
    return { valid: false, message: 'Şifre en az 6 karakter olmalı' };
  }
  if (password.length > 100) {
    return { valid: false, message: 'Şifre çok uzun' };
  }
  return { valid: true, message: '' };
}

/**
 * Validate phone number (Turkish format)
 */
export function isValidPhone(phone: string): boolean {
  // Turkish phone number format: 5XX XXX XX XX or +90 5XX XXX XX XX
  const phoneRegex = /^(\+90|0)?5\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate MAC address format
 */
export function isValidMacAddress(mac: string): boolean {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
}

/**
 * Validate IP address format
 */
export function isValidIpAddress(ip: string): boolean {
  const ipRegex = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.?\b){4}$/;
  return ipRegex.test(ip);
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validate required fields
 */
export function validateRequired(value: unknown, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} zorunludur`;
  }
  return null;
}

/**
 * Validate min length
 */
export function validateMinLength(value: string, minLength: number, fieldName: string): string | null {
  if (value.length < minLength) {
    return `${fieldName} en az ${minLength} karakter olmalı`;
  }
  return null;
}

/**
 * Validate max length
 */
export function validateMaxLength(value: string, maxLength: number, fieldName: string): string | null {
  if (value.length > maxLength) {
    return `${fieldName} en fazla ${maxLength} karakter olabilir`;
  }
  return null;
}

/**
 * Combine multiple validators
 */
export function validateAll(...errors: (string | null)[]): string | null {
  return errors.find((e) => e !== null) || null;
}
