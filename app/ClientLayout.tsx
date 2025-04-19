"use client";
import React from "react";
import LanguageProvider from "../components/LanguageProvider";
import Header from "../components/Header";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

// Reason: Ensures LanguageProvider is a client component and wraps all pages for i18n to update reactively
export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <Header />
          {children}
        </LanguageProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
