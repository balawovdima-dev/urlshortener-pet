// The API URL is resolved at runtime (via /api/config) instead of being
// inlined into the client bundle at build time, so it can change between
// container restarts without a rebuild.
let apiUrlPromise: Promise<string> | null = null;

async function fetchApiUrl(): Promise<string> {
  const res = await fetch("/api/config", { cache: "no-store" });
  const { apiUrl } = (await res.json()) as { apiUrl: string };
  return apiUrl.replace(/\/+$/, "");
}

export function getApiUrl(): Promise<string> {
  if (!apiUrlPromise) {
    apiUrlPromise = fetchApiUrl().catch((err) => {
      apiUrlPromise = null;
      throw err;
    });
  }
  return apiUrlPromise;
}
