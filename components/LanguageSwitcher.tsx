"use client";
import React from 'react';
import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "en", flag: "🇺🇸", label: "Switch to English" },
  { code: "pt", flag: "🇧🇷", label: "Mudar para Português" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  return (
    <div className="flex gap-1 items-center">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          aria-label={label}
          className="text-xl p-0.5 focus:outline-none focus:ring-2 focus:ring-primary transition-opacity"
          onClick={() => i18n.changeLanguage(code)}
          disabled={i18n.language === code}
          style={{ width: 32, height: 32, background: 'none', lineHeight: 1, opacity: i18n.language === code ? 1 : 0.3 }}
        >
          <span role="img" aria-label={label} className="block w-full h-full text-center select-none">
            {flag}
          </span>
        </button>
      ))}
    </div>
  );
}
