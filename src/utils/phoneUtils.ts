/**
 * Ultra-lightweight Persian/Arabic phone normalization and validation
 * High performance, zero external dependencies
 */

// Convert Persian and Arabic numerals to standard Latin digits
export function toEnglishDigits(str: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728))
    .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1584));
}

/**
 * Clean and normalize Iranian mobile numbers:
 * Converts Persian/Arabic digits, removes spaces/dashes, transforms +98/0098/98 to 09...
 */
export function normalizeIranianMobile(input: string): string {
  if (!input) return '';
  // 1. Convert to English digits
  let cleaned = toEnglishDigits(input);
  // 2. Strip all non-digit characters
  cleaned = cleaned.replace(/\D/g, '');

  // 3. Handle prefixes
  if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('98') && cleaned.length === 12) {
    cleaned = '0' + cleaned.slice(2);
  } else if (cleaned.startsWith('9') && cleaned.length === 10) {
    cleaned = '0' + cleaned;
  }

  // Cap at 11 characters
  return cleaned.slice(0, 11);
}

/**
 * Validate Iranian mobile number format (starts with 09 and is 11 digits)
 */
export function isValidIranianMobile(phone: string): boolean {
  const normalized = normalizeIranianMobile(phone);
  return /^09\d{9}$/.test(normalized);
}
