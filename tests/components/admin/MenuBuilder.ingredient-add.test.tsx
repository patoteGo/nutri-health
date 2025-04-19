import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuBuilder from "@/components/admin/MenuBuilder";
import { vi } from "vitest";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockIngredients = [
  { id: "1", name: "Brown Rice", carbs: 23, protein: 2.6, fat: 0.9, unit: "GRAM" },
  { id: "2", name: "Egg", carbs: 1.1, protein: 6.3, fat: 5.3, unit: "UNIT" },
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

import { I18nextProvider } from 'react-i18next';
import i18n from '@/tests/testI18n';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    </I18nextProvider>
  );
}


describe("MenuBuilder ingredient adding", () => {
  it("adds an ingredient and displays it in the list", async () => {
    renderWithProviders(<MenuBuilder menus={[]} onMenusChange={() => {}} personId="1" />);
    const input = screen.getByPlaceholderText(/search ingredient/i);
    fireEvent.change(input, { target: { value: "brown" } });
    await waitFor(() => {
      expect(screen.getByText("Brown Rice")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Brown Rice"));
    const weightInput = screen.getByPlaceholderText(/weight/i);
    fireEvent.change(weightInput, { target: { value: "50" } });
    fireEvent.click(screen.getByText(/add ingredient/i));
    expect(screen.getByText(/Brown Rice — 50g/)).toBeInTheDocument();
  });

  it("shows ingredient name in Portuguese when i18n language is 'pt'", async () => {
    i18n.changeLanguage('pt');
    renderWithProviders(<MenuBuilder menus={[]} onMenusChange={() => {}} personId="1" />);
    const input = screen.getByPlaceholderText(/search ingredient/i);
    fireEvent.change(input, { target: { value: "egg" } });
    await waitFor(() => {
      expect(screen.getByText("Ovo")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Ovo"));
    const qtyInput = screen.getByPlaceholderText(/quantity/i);
    fireEvent.change(qtyInput, { target: { value: "2" } });
    fireEvent.click(screen.getByText(/add ingredient/i));
    expect(screen.getByText(/Ovo — 2/)).toBeInTheDocument();
    i18n.changeLanguage('en'); // reset
  });

  it("prevents adding duplicate ingredients and shows warning", async () => {
    renderWithProviders(<MenuBuilder menus={[]} onMenusChange={() => {}} personId="1" />);
    const input = screen.getByPlaceholderText(/search ingredient/i);
    fireEvent.change(input, { target: { value: "egg" } });
    await waitFor(() => {
      expect(screen.getByText("Egg")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Egg"));
    const qtyInput = screen.getByPlaceholderText(/quantity/i);
    fireEvent.change(qtyInput, { target: { value: "2" } });
    fireEvent.click(screen.getByText(/add ingredient/i));
    // Try to add again
    fireEvent.change(input, { target: { value: "egg" } });
    await waitFor(() => {
      expect(screen.getByText("Egg")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Egg"));
    expect(screen.getByText(/already on the list/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add ingredient/i })).toBeDisabled();
  });

  it("handles edge case: add with zero or negative weight", async () => {
    renderWithProviders(<MenuBuilder menus={[]} onMenusChange={() => {}} personId="1" />);
    const input = screen.getByPlaceholderText(/search ingredient/i);
    fireEvent.change(input, { target: { value: "brown" } });
    await waitFor(() => {
      expect(screen.getByText("Brown Rice")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Brown Rice"));
    const weightInput = screen.getByPlaceholderText(/weight/i);
    fireEvent.change(weightInput, { target: { value: "0" } });
    expect(screen.getByRole("button", { name: /add ingredient/i })).toBeDisabled();
    fireEvent.change(weightInput, { target: { value: "-5" } });
    expect(screen.getByRole("button", { name: /add ingredient/i })).toBeDisabled();
  });
});
