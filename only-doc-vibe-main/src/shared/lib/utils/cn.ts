/**
 * Utility function to conditionally join classNames together.
 * Filters out falsy values and joins the rest with a space.
 *
 * @param classes - Array of class names or conditional class expressions
 * @returns Combined class string
 *
 * @example
 * cn('base-class', isActive && 'active', variant === 'primary' && 'primary-variant')
 * // Returns: 'base-class active primary-variant' (if conditions are true)
 */
export function cn(
  ...classes: ReadonlyArray<string | boolean | undefined | null>
): string {
  return classes.filter(Boolean).join(" ");
}
