import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BackendVersion } from "./BackendVersion";

vi.mock("@/lib/api", () => ({ getHealth: vi.fn() }));
const { getHealth } = await import("@/lib/api");

describe("BackendVersion", () => {
  it("shows the backend version", async () => {
    vi.mocked(getHealth).mockResolvedValue({ status: "ok", version: "1.2.3" });
    render(<BackendVersion />);
    expect(await screen.findByText("API v1.2.3")).toBeInTheDocument();
  });

  it("shows a message when the backend is unreachable", async () => {
    vi.mocked(getHealth).mockRejectedValue(new Error("down"));
    render(<BackendVersion />);
    expect(await screen.findByText("API unreachable")).toBeInTheDocument();
  });
});
