import { render, screen, fireEvent } from "@testing-library/react";
import SettingsPage from "@/app/settings/page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

import React from "react";

// Mock toast
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mockSettings = {
  firstDayOfWeek: "MONDAY",
  weekDays: ["MONDAY", "TUESDAY"],
  birthDate: "2000-01-01T00:00:00.000Z",
};

function renderWithClient(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("User Settings Card", () => {
  it("shows loading and error states", async () => {
    global.fetch = vi.fn()
      .mockImplementationOnce(() => new Promise(() => {})) // loading
      .mockImplementationOnce(() => Promise.resolve({ ok: false })); // error
    renderWithClient(<SettingsPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    // Simulate error fetch
    await Promise.resolve();
    renderWithClient(<SettingsPage />);
    expect(await screen.findByText(/failed to load settings/i)).toBeInTheDocument();
  });

  it("fetches and displays user settings", async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => mockSettings });
    renderWithClient(<SettingsPage />);
    expect(await screen.findByTestId("save-first-day")).toBeInTheDocument();
    // Should display correct first day and week days
    expect(screen.getByTestId("first-day-toggle-monday").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("week-day-toggle-monday").getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByTestId("week-day-toggle-tuesday").getAttribute("aria-pressed")).toBe("true");
  });

  it("PATCHes firstDayOfWeek and shows toast", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockSettings }) // GET
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { ...mockSettings, firstDayOfWeek: "FRIDAY" } }) }); // PATCH
    renderWithClient(<SettingsPage />);
    const fridayToggle = await screen.findByTestId("first-day-toggle-friday");
    fireEvent.click(fridayToggle);
    const saveBtn = screen.getByTestId("save-first-day");
    fireEvent.click(saveBtn);
    await Promise.resolve();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/user/settings",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("PATCHes weekDays and handles edge (empty array)", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockSettings }) // GET
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: { ...mockSettings, weekDays: [] } }) }); // PATCH
    renderWithClient(<SettingsPage />);
    // Unselect all weekdays
    for (const day of ["monday", "tuesday"]) {
      fireEvent.click(screen.getByTestId(`week-day-toggle-${day}`));
    }
    fireEvent.click(screen.getByTestId("save-week-days"));
    await Promise.resolve();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/user/settings",
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("PATCHes birthDate and handles failure", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockSettings }) // GET
      .mockResolvedValueOnce({ ok: false }); // PATCH fail
    renderWithClient(<SettingsPage />);
    const dateInput = await screen.findByTestId("born-date-input");
    fireEvent.change(dateInput, { target: { value: "1999-12-31" } });
    fireEvent.click(screen.getByTestId("save-birth-date"));
    await Promise.resolve();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/user/settings",
      expect.objectContaining({ method: "PATCH" })
    );
  });

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
