/** Truncates long filenames in the middle while keeping the extension visible. */
export function truncateMiddle(name: string, max = 28): string {
  if (name.length <= max) return name;
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 && name.length - dot <= 6 ? name.slice(dot) : "";
  const base = ext ? name.slice(0, dot) : name;
  const keep = max - ext.length - 1;
  const head = Math.ceil(keep * 0.6);
  return `${base.slice(0, head)}…${base.slice(base.length - (keep - head))}${ext}`;
}
