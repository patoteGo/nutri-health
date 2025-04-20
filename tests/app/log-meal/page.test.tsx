// Must import React at the very top to ensure it's defined globally
import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { describe, expect, it, beforeAll } from 'vitest';
global.React = React; // Explicitly make React global to avoid 'React is not defined' errors
import userEvent from "@testing-library/user-event";
import LogMealPage from "@/app/log-meal/page";
import Header from "@/components/Header";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import '@testing-library/jest-dom';

import { vi } from 'vitest';

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User", email: "test@example.com" } },
    status: "authenticated",
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Helper function to select an option from a Shadcn UI Select component
async function selectOption(label: string | RegExp, optionText: string) {
  const user = userEvent.setup();
  // Find the trigger associated with the label. Shadcn uses button with role 'combobox'.
  const labelElement = screen.getByText(label);
  const container = labelElement.closest('div'); // Assuming label and select are in a div
  if (!container) throw new Error(`Could not find container for label: ${label}`);
  const trigger = within(container).getByRole('combobox');

  await user.click(trigger);
  const listbox = await screen.findByRole('listbox');
  const optionElement = within(listbox).getByText(optionText);
  await user.click(optionElement);
}

// Tests for LogMealPage multilingual header (Header with LanguageSwitcher)

// 1. Happy path: Header renders with LanguageSwitcher
// 2. Edge: Language switching changes UI
// 3. Failure: Menu not present if Header not rendered

describe('LogMealPage component', () => {
  it("Header renders with LanguageSwitcher on log-meal page", async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Header />
        <LogMealPage />
      </I18nextProvider>
    );
    expect(screen.getByText("Log a Meal")).toBeInTheDocument();
    // Test for LanguageSwitcher by data-testid (should add this to component if not present)
    expect(screen.getByTestId("language-switcher")).toBeInTheDocument();
    const personContainer = screen.getByText("Select Person").closest('div');
    if (!personContainer) throw new Error('Could not find container for label Select Person');
    // # Reason: Check displayed text within the combobox's container, as accessible name update might be unreliable in JSDOM.
    // Assert that the placeholder is shown initially, not the first option's text
    expect(within(personContainer).getByText(i18n.t('choose_person'))).toBeInTheDocument();

    // Select Meal
    const mealLabel = screen.getByText(/Select Meal/i);
    const mealContainer = mealLabel.closest('div');
    if (!mealContainer) throw new Error('Could not find container for label Select Meal');
    await selectOption(/Select Meal/i, "Lunch");
    expect(within(mealContainer).getByText("Lunch")).toBeInTheDocument();

    // Select Week - Find by role 'combobox' within the 'Select Week' container, then click first option
    const weekLabel = screen.getByText(/Select Week/i);
    const weekContainer = weekLabel.closest('div');
    if (!weekContainer) throw new Error('Could not find container for label Select Week');
    await userEvent.setup().click(within(weekContainer).getByRole('combobox'));
    const listbox = await screen.findByRole('listbox'); // Wait for listbox to appear
    const weekOptionElements = within(listbox).getAllByRole('option');
    await userEvent.setup().click(weekOptionElements[0]);
    // Check displayed value (more robustly - check if the combobox value is NOT the placeholder)
    expect(within(weekContainer).getByRole('combobox')).not.toHaveTextContent(/choose week/i);

    // Select Option
    const optionLabel = screen.getByText(/Meal Option/i);
    const optionContainer = optionLabel.closest('div');
    if (!optionContainer) throw new Error('Could not find container for label Meal Option');
    await selectOption(/Meal Option/i, "2");
    expect(within(optionContainer).getByText("2")).toBeInTheDocument();
  });

  it("shows all meal options (1, 2, 3)", async () => {
    render(<LogMealPage />);
    const user = userEvent.setup();
    // # Reason: Target the combobox associated with the 'Meal Option' label.
    const labelElement = screen.getByText(/Meal Option/i);
    const container = labelElement.closest('div');
    if (!container) throw new Error('Could not find container for label Meal Option');
    await user.click(within(container).getByRole('combobox'));

    // Find the listbox (Radix Select options container)
    const listbox = await screen.findByRole("listbox");
    expect(within(listbox).getByText("1")).toBeInTheDocument();
    expect(within(listbox).getByText("2")).toBeInTheDocument();
    expect(within(listbox).getByText("3")).toBeInTheDocument();
  });

  it("does not crash if nothing is selected", () => {
    render(<LogMealPage />);
    expect(screen.getByText("Log a Meal")).toBeInTheDocument();
  });
});
