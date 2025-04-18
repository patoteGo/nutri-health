import React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from 'vitest';
import userEvent from "@testing-library/user-event";
import LogMealPage from "@/app/log-meal/page";
import '@testing-library/jest-dom';

describe("LogMealPage", () => {
  it("renders all selectors with correct placeholders", () => {
    render(<LogMealPage />);
    expect(screen.getByText(/Log a Meal/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Person/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Meal/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Week/i)).toBeInTheDocument();
    expect(screen.getByText(/Meal Option/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Choose/)).toHaveLength(4);
  });

  it("allows selecting a person, meal, week, and option", async () => {
    render(<LogMealPage />);
    const user = userEvent.setup();

    // Helper function to select an option
    const selectOption = async (label: RegExp, optionText: string | RegExp) => {
      const labelElement = screen.getByText(label);
      const container = labelElement.closest('div');
      if (!container) throw new Error(`Could not find container for label ${label}`);
      // # Reason: Target the combobox within the label's container, as direct text/name query can fail due to internal structure.
      await user.click(within(container).getByRole('combobox'));
      await user.click(await screen.findByText(optionText)); // Find option in the opened listbox
    };

    // Select Person
    await selectOption(/Select Person/i, "Alice");
    const personLabel = screen.getByText(/Select Person/i);
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
