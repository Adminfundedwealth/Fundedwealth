/**
 * Feature Flags Configuration
 * 
 * Centralized feature toggles for development and production.
 */

export const FEATURES = {
  /**
   * Cloudflare Turnstile CAPTCHA
   * 
   * When true: CAPTCHA widget is shown and validation is enforced
   * When false: CAPTCHA is bypassed completely (for development/testing)
   * 
   * @default false (temporarily disabled for production testing)
   */
  ENABLE_TURNSTILE: false,
} as const;
