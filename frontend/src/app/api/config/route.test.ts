// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("GET /api/config", () => {
  it("returns the API URL from the runtime environment", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api.example.com");
    await expect(GET().json()).resolves.toEqual({
      apiUrl: "https://api.example.com",
    });
  });

  it("falls back to localhost", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    await expect(GET().json()).resolves.toEqual({
      apiUrl: "http://localhost:8000",
    });
  });
});
