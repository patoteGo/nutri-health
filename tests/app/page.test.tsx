import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
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
    expect(screen.getByText('Welcome to NutriHealth!')).toBeInTheDocument();
  });
  it('renders welcome message in Portuguese', () => {
    i18n.changeLanguage('pt');
    renderWithI18n(<Home />);
    expect(screen.getByText('Bem-vindo ao NutriHealth!')).toBeInTheDocument();
  });
  it('switches language using LanguageSwitcher', () => {
    i18n.changeLanguage('en');
    renderWithI18n(<Home />);
    fireEvent.click(screen.getByText('Português'));
    expect(screen.getByText('Bem-vindo ao NutriHealth!')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Inglês'));
    expect(screen.getByText('Welcome to NutriHealth!')).toBeInTheDocument();
  });
  it('falls back to English for unsupported language', () => {
    i18n.changeLanguage('fr');
    renderWithI18n(<Home />);
    expect(screen.getByText('Welcome to NutriHealth!')).toBeInTheDocument();
  });
});
