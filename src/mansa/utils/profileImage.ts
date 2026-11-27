/** Only an explicitly supplied image may be rendered; never invent a fallback. */
export function profileImageSource(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}