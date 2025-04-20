// Must import React at the very top to ensure it's defined globally
import React from 'react';
import { render, screen } from "@testing-library/react";
import Header from "@/components/Header";
import { usePathname } from "next/navigation";
import { describe, expect, it, vi, beforeAll } from "vitest";
import '@testing-library/jest-dom';
global.React = React; // Explicitly make React global to avoid 'React is not defined' errors

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

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

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
