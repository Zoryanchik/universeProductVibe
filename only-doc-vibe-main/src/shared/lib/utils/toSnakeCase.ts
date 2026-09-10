const CAMEL_TO_SNAKE_REGEX = /\.?([A-Z]+)/g; // Matches uppercase letters for camelCase to snake_case
const SPACE_DASH_TO_UNDERSCORE_REGEX = /[\s-]+/g; // Matches spaces and dashes
const LEADING_TRAILING_UNDERSCORE_REGEX = /^_+|_+$/g; // Matches leading and trailing underscores

export function toSnakeCase(str: string): string {
  return str
    .toLowerCase()
    .replace(CAMEL_TO_SNAKE_REGEX, (y) => "_" + y.toLowerCase())
    .replace(SPACE_DASH_TO_UNDERSCORE_REGEX, "_")
    .replace(LEADING_TRAILING_UNDERSCORE_REGEX, "")
    .toLowerCase();
}
