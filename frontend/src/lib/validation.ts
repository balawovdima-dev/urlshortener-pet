const ALIAS_PATTERN = /^[A-Za-z0-9_-]+$/;
const RESERVED_ALIASES = new Set([
  "api",
  "docs",
  "redoc",
  "healthz",
  "readyz",
  "metrics",
]);

export function validateUrl(value: string): string | undefined {
  if (!value) return "Please enter a URL.";
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return "Please enter a valid URL, e.g. https://example.com.";
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return "Only http:// and https:// URLs are supported.";
  }
  if (!parsed.hostname) return "Please enter a valid URL.";
  return undefined;
}

export function validateAlias(value: string): string | undefined {
  if (!value) return undefined;
  if (value.length < 3 || value.length > 32) {
    return "Alias must be 3–32 characters long.";
  }
  if (!ALIAS_PATTERN.test(value)) {
    return "Alias may only contain letters, numbers, _ and -.";
  }
  if (RESERVED_ALIASES.has(value)) {
    return "This alias is reserved.";
  }
  return undefined;
}
