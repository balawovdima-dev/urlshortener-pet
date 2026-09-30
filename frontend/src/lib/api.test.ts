import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const fetchMock = vi.fn();

beforeEach(() => {
  vi.resetModules();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://api.test/");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("api client", () => {
  it("prefixes requests with the configured API URL", async () => {
    fetchMock.mockResolvedValueOnce(json({ status: "ok", version: "1.0" }));
    const { getHealth } = await import("./api");

    await expect(getHealth()).resolves.toEqual({ status: "ok", version: "1.0" });
    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/healthz");
  });

  it("uses relative paths when no API URL is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_API_URL", "");
    fetchMock.mockResolvedValueOnce(json({ status: "ok", version: "1.0" }));
    const { getHealth } = await import("./api");

    await getHealth();
    expect(fetchMock.mock.calls[0][0]).toBe("/healthz");
  });

  it("maps validation errors to field errors", async () => {
    fetchMock.mockResolvedValueOnce(
      json(
        { detail: [{ loc: ["body", "url"], msg: "Value error, bad url" }] },
        422,
      ),
    );
    const { createLink, ApiError } = await import("./api");

    const err = await createLink({ url: "x" }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 422, fieldErrors: { url: "bad url" } });
  });

  it("reports an unreachable backend", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("network"));
    const { getLink } = await import("./api");

    await expect(getLink("abc")).rejects.toMatchObject({ status: 0 });
  });
});
