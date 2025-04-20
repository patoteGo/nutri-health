import { render, screen, fireEvent } from "@testing-library/react";
import SettingsPage from "@/app/settings/page";
import React from "react";

describe("User Settings Card", () => {
  it("renders user settings fields", () => {
    render(<SettingsPage />);
    expect(screen.getByLabelText(/Born date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Current weight/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Height/i)).toBeInTheDocument();
    expect(screen.getByText(/Gender/i)).toBeInTheDocument();
  });

  it("calculates age from born date", () => {
    render(<SettingsPage />);
    const bornInput = screen.getByTestId("born-date-input");
    fireEvent.change(bornInput, { target: { value: "2000-01-01" } });
    const age = new Date().getFullYear() - 2000;
    expect(screen.getByTestId("age-value").textContent).toContain(age.toString());
  });

  it("allows entering weight and height", () => {
    render(<SettingsPage />);
    const weightInput = screen.getByTestId("weight-input");
    fireEvent.change(weightInput, { target: { value: "80" } });
    expect(weightInput).toHaveValue(80);
    const heightInput = screen.getByTestId("height-input");
    fireEvent.change(heightInput, { target: { value: "180" } });
    expect(heightInput).toHaveValue(180);
  });

  it("allows selecting gender", () => {
    render(<SettingsPage />);
    const maleToggle = screen.getByTestId("gender-male");
    fireEvent.click(maleToggle);
    expect(maleToggle.getAttribute("aria-pressed")).toBe("true");
    const femaleToggle = screen.getByTestId("gender-female");
    fireEvent.click(femaleToggle);
    expect(femaleToggle.getAttribute("aria-pressed")).toBe("true");
  });
});
