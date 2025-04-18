import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { expect } from 'vitest';
import Home from '../../app/page';
import i18n from '../../i18n';
import { I18nextProvider } from 'react-i18next';

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}

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
    fireEvent.click(screen.getByRole('button', { name: 'Mudar para Português' }));
    expect(screen.getByText('Bem-vindo ao NutriHealth!')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Switch to English' }));
    expect(screen.getByText('Welcome to NutriHealth!')).toBeTruthy();
  });
  it('falls back to English for unsupported language', () => {
    i18n.changeLanguage('fr');
    renderWithI18n(<Home />);
    expect(screen.getByText('Welcome to NutriHealth!')).toBeTruthy();
  });
});
