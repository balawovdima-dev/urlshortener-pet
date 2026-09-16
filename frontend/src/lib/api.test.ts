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
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api client", () => {
  it("resolves the API URL at runtime and caches it", async () => {
    fetchMock.mockImplementation((url: string) =>
      Promise.resolve(
        url === "/api/config"
          ? json({ apiUrl: "http://api.test/" })
          : json({ status: "ok", version: "1.0" }),
      ),
    );
    const { getHealth } = await import("./api");

    await expect(getHealth()).resolves.toEqual({ status: "ok", version: "1.0" });
    await getHealth();

    const urls = fetchMock.mock.calls.map(([url]) => url);
    expect(urls).toEqual([
      "/api/config",
      "http://api.test/healthz",
      "http://api.test/healthz",
    ]);
  });

  it("maps validation errors to field errors", async () => {
    fetchMock
      .mockResolvedValueOnce(json({ apiUrl: "http://api.test" }))
      .mockResolvedValueOnce(
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
    fetchMock
      .mockResolvedValueOnce(json({ apiUrl: "http://api.test" }))
      .mockRejectedValueOnce(new TypeError("network"));
    const { getLink } = await import("./api");

    await expect(getLink("abc")).rejects.toMatchObject({ status: 0 });
  });
});
