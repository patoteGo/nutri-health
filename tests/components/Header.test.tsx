import React from "react";
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
}));

vi.mock("@/components/LanguageSwitcher", () => ({
  default: () => <div data-testid="lang-switch">LanguageSwitcher</div>
}));

// Helper to set pathname mock
const mockPathname = (path: string | null) => {
  (usePathname as unknown as ReturnType<typeof vi.fn>).mockReturnValue(path);
};

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User", email: "test@example.com" } },
    status: "authenticated",
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

describe("Header", () => {
  it("renders breadcrumb for root", () => {
    mockPathname("/");
    render(<Header />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.queryByText("Log Meal")).not.toBeInTheDocument();
  });

  it("renders breadcrumb for nested path", () => {
    mockPathname("/log-meal");
    render(<Header />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Log Meal")).toBeInTheDocument();
  });

  it("renders breadcrumb for deep path", () => {
    mockPathname("/log-meal/food");
    render(<Header />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Log Meal")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
  });

  it("shows LanguageSwitcher", () => {
    mockPathname("/");
    render(<Header />);
    expect(screen.getByTestId("lang-switch")).toBeInTheDocument();
  });
});
