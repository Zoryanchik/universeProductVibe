/** Remove leading and trailing slashes from a slug; nullish becomes "". */
export function stripSlashes(slug: string | undefined | null): string {
  return (slug ?? "").replace(/^\/+|\/+$/g, "");
}
