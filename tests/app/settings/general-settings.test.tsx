import { render, screen, fireEvent } from "@testing-library/react";
import SettingsPage from "@/app/settings/page";
import React from "react";

describe("General Settings Card", () => {
  it("renders the general settings card", () => {
    render(<SettingsPage />);
    expect(screen.getByText(/General Settings/i)).toBeInTheDocument();
    expect(screen.getByText(/First day of the week/i)).toBeInTheDocument();
    expect(screen.getByText(/Days in a week/i)).toBeInTheDocument();
  });

  it("allows selecting the first day of the week", () => {
    render(<SettingsPage />);
    const mondayToggle = screen.getByTestId("first-day-toggle-monday");
    fireEvent.click(mondayToggle);
    expect(mondayToggle.getAttribute("aria-pressed")).toBe("true");
  });

  it("allows setting number of days in a week with slider", () => {
    render(<SettingsPage />);
    const slider = screen.getByTestId("days-in-week-slider");
    // Simulate changing the slider value
    fireEvent.change(slider.querySelector("input")!, { target: { value: 6 } });
    expect(screen.getByText(/6 days/)).toBeInTheDocument();
  });

  it("shows edge cases for slider (1 and 7)", () => {
    render(<SettingsPage />);
    const slider = screen.getByTestId("days-in-week-slider");
    fireEvent.change(slider.querySelector("input")!, { target: { value: 1 } });
    expect(screen.getByText(/1 day/)).toBeInTheDocument();
    fireEvent.change(slider.querySelector("input")!, { target: { value: 7 } });
    expect(screen.getByText(/7 days/)).toBeInTheDocument();
  });
});
