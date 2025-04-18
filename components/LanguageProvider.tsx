"use client";
import React, { useEffect } from "react";
import i18n from "../i18n";
import { I18nextProvider } from "react-i18next";

// Reason: Ensures i18n instance is initialized for all client components.
export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ensures i18n is initialized once on mount
  }, []);
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
