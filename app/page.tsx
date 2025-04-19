"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useTranslation } from "react-i18next";
// LanguageProvider and LanguageSwitcher are now provided globally in layout.tsx

import { useSession } from "next-auth/react";

export default function Home() {
  const { t } = useTranslation(); // Reason: Enables translations for all UI strings
  const { data: session } = useSession();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-2 py-4 sm:px-4">
      {/* LanguageSwitcher is now in Header (global) */}
      <header className="w-full max-w-md mx-auto py-2 flex flex-col items-center">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Nutri-Health</h1>
        <p className="text-sm text-muted-foreground mb-4 text-center">{t("welcome")}</p>
      </header>
      <main className="flex flex-col gap-6 w-full max-w-md">
        {/* Meal Logging Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("log_meals", "Log Today’s Meals")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/log-meal">{t("log_meal_btn", "Log a Meal")}</Link>
              </Button>
              <p className="text-xs text-muted-foreground">{t("log_limit", "You can log up to 6 meals per day.")}</p>
            </div>
          </CardContent>
        </Card>
        {/* Weekly Progress Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("weekly_progress", "Weekly Progress")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={40} className="mb-2" />
            <p className="text-xs text-muted-foreground">{t("week_logged", "4/6 days logged this week. Keep going!")}</p>
            <Button asChild variant="outline" size="sm" className="mt-2 w-full">
              <Link href="/progress">{t("view_details", "View Details")}</Link>
            </Button>
          </CardContent>
        </Card>
        {/* Profile & Bioimpedance */}
        <Card>
          <CardHeader>
            <CardTitle>{t("profile_metrics", "Profile & Metrics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full mb-2">
              <Link href="/profile">{t("view_profile", "View Profile")}</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link href="/metrics">{t("bioimpedance_data", "Bioimpedance Data")}</Link>
            </Button>
          </CardContent>
        </Card>
        {/* Admin Panel Access */}
        {session && (
          <Card>
            <CardHeader>
              <CardTitle>{t("admin_dashboard", "Admin Dashboard")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="destructive" className="w-full">
                <Link href="/admin/meals">{t("admin_meal_dashboard_btn", "Go to Admin Meal Dashboard")}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
        <div className="w-full text-center text-muted-foreground text-sm py-6">
          {t("coming_soon", "Coming soon")}
        </div>
      </main>
              <footer className="mt-10 text-xs text-muted-foreground text-center">
          Nutri-Health &copy; {new Date().getFullYear()} &mdash; {t("powered_by", "Powered by Next.js, V0, ShadCN UI")}
        </footer>
      </div>
  );
}
