// Type to extract nested property types from translation object
type PathValue<T, P extends string> = P extends keyof T
  ? T[P]
  : P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : never
    : never;

// Type to get all possible paths in a nested object
type Paths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? K | `${K}.${Paths<T[K]>}`
        : K;
    }[keyof T & string]
  : never;

// Generic TFunction that works with any translation structure
export type TFunction<T = Record<string, unknown>> = {
  // When key points to a string value, return string
  <K extends string>(
    key: K extends Paths<T> ? (PathValue<T, K> extends string ? K : never) : K,
    options?: Record<string, string | number>
  ): string;

  // When key points to an object value, return the object
  <K extends string, R = unknown>(
    key: K extends Paths<T> ? (PathValue<T, K> extends object ? K : never) : K
  ): R;

  // Fallback for any key (for dynamic keys)
  (
    key: string,
    options?: Record<string, string | number>
  ): string | Record<string, unknown>;
};
