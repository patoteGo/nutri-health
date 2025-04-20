"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

// Helper to calculate age from date string (YYYY-MM-DD)
function calculateAge(dateString: string): number {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { data: session } = useSession();

  // General settings state
  const [firstDay, setFirstDay] = useState<string>("monday");
  const [daysInWeek, setDaysInWeek] = useState<number>(7);

  // User settings state
  const [bornDate, setBornDate] = useState<string>("");
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState<string>("");

  const days = [
    { value: "sunday", label: "Sunday" },
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
  ];

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('settings_title')}</h1>
        <LanguageSwitcher />
      </div>

      {/* General Settings Card */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle>{t('general_settings')}</CardTitle>
          <p className="text-muted-foreground mt-2">
            {t('general_settings_desc')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-8">
            {/* First Day of the Week */}
            <div>
              <div className="mb-2 font-medium">{t('first_day_of_week')}</div>
              <ToggleGroup
                type="single"
                value={firstDay}
                onValueChange={val => val && setFirstDay(val)}
                className="flex gap-2"
                data-testid="first-day-toggle-group"
              >
                {days.map(day => (
                  <ToggleGroupItem
                    key={day.value}
                    value={day.value}
                    aria-label={t(`weekday_${day.value}`)}
                    data-testid={`first-day-toggle-${day.value}`}
                    className="capitalize"
                  >
                    {t(`weekday_${day.value}`).slice(0, 3)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <div className="text-muted-foreground mt-1 text-sm">
                {t('selected')}: {t(`weekday_${firstDay}`)}
              </div>
              <div className="text-muted-foreground text-xs mt-1">
                {t('first_day_desc')}
              </div>
            </div>

            {/* Days in a Week */}
            <div>
              <div className="mb-2 font-medium">{t('days_in_week')}</div>
              <div data-testid="days-in-week-slider" className="flex items-center gap-4">
                <Slider
                  min={1}
                  max={7}
                  step={1}
                  value={[daysInWeek]}
                  onValueChange={([val]) => setDaysInWeek(val)}
                  className="w-48"
                  aria-label={t('days_in_week')}
                />
                <span className="text-muted-foreground">
                  {daysInWeek} {daysInWeek === 1 ? t('day') : t('days')}
                </span>
              </div>
              <div className="text-muted-foreground text-xs mt-1">
                {t('days_in_week_desc')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Settings Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('user_settings')}</CardTitle>
          <p className="text-muted-foreground mt-2">
            {t('user_settings_desc')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-8">
            {/* Born date and age */}
            <div>
              <label htmlFor="born-date" className="block font-medium mb-1">{t('born_date')}</label>
              <div className="flex items-center gap-4">
                <ReactDatePicker
                  id="born-date"
                  selected={bornDate ? new Date(bornDate) : null}
                  onChange={date => {
                    if (date) {
                      // Convert to ISO string YYYY-MM-DD for storage
                      const iso = date.toISOString().split("T")[0];
                      setBornDate(iso);
                    } else {
                      setBornDate("");
                    }
                  }}
                  maxDate={new Date()}
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  dateFormat="dd/MM/yyyy"
                  placeholderText={t('born_date_placeholder')}
                  className="input input-bordered"
                  data-testid="born-date-input"
                  isClearable
                />
                <span className="text-muted-foreground text-sm" data-testid="age-value">
                  {t('age')}: {bornDate ? calculateAge(bornDate) : '--'}
                </span>
              </div>
            </div>

            {/* Current weight */}
            <div>
              <label htmlFor="current-weight" className="block font-medium mb-1">{t('current_weight_kg')}</label>
              <Select
                value={weight ? String(weight) : ""}
                onValueChange={val => setWeight(Number(val))}
                data-testid="weight-input"
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('select_weight')} />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(171)].map((_, i) => {
                    const val = i + 30;
                    return (
                      <SelectItem key={val} value={String(val)}>{val} {t('kg')}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Height in cm */}
            <div>
              <label htmlFor="height-cm" className="block font-medium mb-1">{t('height_cm')}</label>
              <Select
                value={height ? String(height) : ""}
                onValueChange={val => setHeight(Number(val))}
                data-testid="height-input"
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('select_height')} />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(151)].map((_, i) => {
                    const val = i + 100;
                    return (
                      <SelectItem key={val} value={String(val)}>{val} {t('cm')}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Gender */}
            <div>
              <label className="block font-medium mb-1">{t('gender')}</label>
              <ToggleGroup
                type="single"
                value={gender}
                onValueChange={val => val && setGender(val)}
                className="flex gap-2"
                data-testid="gender-toggle-group"
              >
                <ToggleGroupItem value="male" data-testid="gender-male">{t('male')}</ToggleGroupItem>
                <ToggleGroupItem value="female" data-testid="gender-female">{t('female')}</ToggleGroupItem>
                <ToggleGroupItem value="other" data-testid="gender-other">{t('other')}</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          <hr className="my-8 border-muted-foreground/20" />

          {/* Session info */}
          {session?.user && (
            <div className="mt-8">
              <div className="mb-2 font-medium">{t('account')}</div>
              <div className="text-muted-foreground text-sm">
                <p><strong>Email:</strong> {session.user.email}</p>
                {session.user.name && <p><strong>Name:</strong> {session.user.name}</p>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
