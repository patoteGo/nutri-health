import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuBuilder from "@/components/admin/MenuBuilder";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

// Mock fetch for /api/ingredients
const mockIngredients = [
  { id: "1", name: "Chicken Breast", carbs: 0, protein: 31, fat: 3.6 },
  { id: "2", name: "Broccoli", carbs: 7, protein: 2.8, fat: 0.4 },
];

global.fetch = vi.fn(async (url) => {
  if (typeof url === "string" && url.includes("/api/ingredients")) {
    return {
      ok: true,
      json: async () => mockIngredients.filter(ing => ing.name.toLowerCase().includes(url.split("search=")[1]?.toLowerCase() || "")),
    } as any;
  }
  throw new Error("Unexpected fetch url: " + url);
});

describe("MenuBuilder ingredient search", () => {
  it("shows ingredient options as user types", async () => {
    renderWithQueryClient(<MenuBuilder menus={[]} onMenusChange={() => {}} />);
    const input = screen.getByPlaceholderText(/search ingredient/i);
    fireEvent.change(input, { target: { value: "chick" } });
    await waitFor(() => {
      expect(screen.getByText("Chicken Breast")).toBeInTheDocument();
    });
  });

  it("shows nutrition info in search results", async () => {
    renderWithQueryClient(<MenuBuilder menus={[]} onMenusChange={() => {}} />);
    const input = screen.getByPlaceholderText(/search ingredient/i);
    fireEvent.change(input, { target: { value: "broc" } });
    await waitFor(() => {
      expect(screen.getByText(/7g carbs, 2.8g protein, 0.4g fat/)).toBeInTheDocument();
    });
  });

  it("handles no results", async () => {
    renderWithQueryClient(<MenuBuilder menus={[]} onMenusChange={() => {}} />);
    const input = screen.getByPlaceholderText(/search ingredient/i);
    fireEvent.change(input, { target: { value: "xyz" } });
    await waitFor(() => {
      expect(screen.queryByText("Chicken Breast")).not.toBeInTheDocument();
      expect(screen.queryByText("Broccoli")).not.toBeInTheDocument();
    });
  });

  it("handles fetch error", async () => {
    (global.fetch as any).mockImplementationOnce(async () => ({ ok: false }));
    renderWithQueryClient(<MenuBuilder menus={[]} onMenusChange={() => {}} />);
    const input = screen.getByPlaceholderText(/search ingredient/i);
    fireEvent.change(input, { target: { value: "egg" } });
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch ingredients/i)).toBeInTheDocument();
    });
  });
});
