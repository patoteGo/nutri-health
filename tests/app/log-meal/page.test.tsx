import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { describe, expect, it } from 'vitest';
import userEvent from "@testing-library/user-event";
import LogMealPage from "@/app/log-meal/page";
import Header from "@/components/Header";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import '@testing-library/jest-dom';

// Tests for LogMealPage multilingual header (Header with LanguageSwitcher)

// 1. Happy path: Header renders with LanguageSwitcher
// 2. Edge: Language switching changes UI
// 3. Failure: Menu not present if Header not rendered

test("Header renders with LanguageSwitcher on log-meal page", () => {
  render(
    <I18nextProvider i18n={i18n}>
      <Header />
      <LogMealPage />
    </I18nextProvider>
  );
  expect(screen.getByText("Log a Meal")).toBeInTheDocument();
  // Test for LanguageSwitcher by data-testid (should add this to component if not present)
  expect(screen.getByTestId("language-switcher")).toBeInTheDocument();
    const personContainer = personLabel.closest('div');
    if (!personContainer) throw new Error('Could not find container for label Select Person');
    // # Reason: Check displayed text within the combobox's container, as accessible name update might be unreliable in JSDOM.
    expect(within(personContainer).getByText("Alice")).toBeInTheDocument();

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
    await user.click(within(weekContainer).getByRole('combobox'));
    const listbox = await screen.findByRole('listbox'); // Wait for listbox to appear
    const weekOptionElements = within(listbox).getAllByRole('option');
    await user.click(weekOptionElements[0]);
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
