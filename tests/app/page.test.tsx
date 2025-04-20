/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Home from '../../app/page';
import i18n from '../../i18n';
import { I18nextProvider } from 'react-i18next';
import LanguageProvider from '../../components/LanguageProvider';
import Header from '../../components/Header';

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User", email: "test@example.com" } },
    status: "authenticated",
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Reason: Render component within the global layout structure (Provider + Header) for accurate testing
function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <Header />
        {ui}
      </LanguageProvider>
    </I18nextProvider>
  );
}

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

describe('Home page i18n', () => {

  it('renders welcome message in English by default', () => {
    i18n.changeLanguage('en');
    renderWithI18n(<Home />);
    expect(screen.getByText('Welcome to NutriHealth!')).toBeTruthy();
  });
  it('renders welcome message in Portuguese', () => {
    i18n.changeLanguage('pt');
    renderWithI18n(<Home />);
    expect(screen.getByText('Bem-vindo ao NutriHealth!')).toBeTruthy();
  });
  it('switches language using LanguageSwitcher', () => {
    i18n.changeLanguage('en');
    renderWithI18n(<Home />);
    // Find the language switcher by test id
    const switcher = screen.getByTestId('language-switcher');
    expect(switcher).toBeTruthy();
    // Find the Portuguese button by aria-label
    const ptButton = screen.getByRole('button', { name: 'Mudar para Português' });
    expect(ptButton).toBeTruthy();
    fireEvent.click(ptButton);
    expect(screen.getByText('Bem-vindo ao NutriHealth!')).toBeTruthy();
    // Find the English button by aria-label
    const enButton = screen.getByRole('button', { name: 'Switch to English' });
    expect(enButton).toBeTruthy();
    fireEvent.click(enButton);
    expect(screen.getByText('Welcome to NutriHealth!')).toBeTruthy();
  });
  it('falls back to English for unsupported language', () => {
    i18n.changeLanguage('fr');
    renderWithI18n(<Home />);
    expect(screen.getByText('Welcome to NutriHealth!')).toBeTruthy();
  });
});
