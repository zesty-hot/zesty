/**
 * Converts enum-style strings (SNAKE_CASE) to Title Case
 * @example
 * formatEnum('PRIVATE_AD_SERVICE') // "Private Ad Service"
 * formatEnum('GUEST') // "Guest"
 */
export function formatEnum(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
