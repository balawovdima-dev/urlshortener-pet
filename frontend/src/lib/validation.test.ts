import { describe, expect, it } from "vitest";
import { validateAlias, validateUrl } from "./validation";

describe("validateUrl", () => {
  it("accepts http and https URLs", () => {
    expect(validateUrl("https://example.com")).toBeUndefined();
    expect(validateUrl("http://example.com/path?q=1")).toBeUndefined();
  });

  it("rejects empty, malformed and non-http URLs", () => {
    expect(validateUrl("")).toBeDefined();
    expect(validateUrl("not a url")).toBeDefined();
    expect(validateUrl("ftp://example.com")).toBeDefined();
  });
});

describe("validateAlias", () => {
  it("allows an empty alias", () => {
    expect(validateAlias("")).toBeUndefined();
  });

  it("accepts a valid alias", () => {
    expect(validateAlias("my-link_1")).toBeUndefined();
  });

  it("rejects bad length, characters and reserved words", () => {
    expect(validateAlias("ab")).toBeDefined();
    expect(validateAlias("a".repeat(33))).toBeDefined();
    expect(validateAlias("bad alias!")).toBeDefined();
    expect(validateAlias("metrics")).toBeDefined();
  });
});
