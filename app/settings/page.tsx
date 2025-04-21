"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Zod schema for settings PATCH
const WeekdayEnum = z.enum([
  "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
]);
const SettingsSchema = z.object({
  firstDayOfWeek: WeekdayEnum.optional(),
  weekDays: z.array(WeekdayEnum).optional(),
  birthDate: z.string().optional(),
  weight: z.number().optional(),
  gender: z.string().optional(),
  height: z.number().optional(),
});

// Helper to map UI <-> backend enum casing
const toBackendDay = (d: string) => d.toUpperCase();
const fromBackendDay = (d: string) => d.toLowerCase();
const toBackendDays = (arr: string[]) => arr.map(toBackendDay);
const fromBackendDays = (arr: string[]) => arr.map(fromBackendDay);


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
  const queryClient = useQueryClient();

  // Settings state
  const [firstDay, setFirstDay] = useState<string>("monday");
  const [weekDays, setWeekDays] = useState<string[]>(["monday","tuesday","wednesday","thursday","friday","saturday","sunday"]);
  const [bornDate, setBornDate] = useState<string>("");
  // Local-only state for UI fields not yet connected to backend
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState<string>("");
  // UI state for PATCH loading
  const [saving, setSaving] = useState(false);

  // Fetch user settings from backend
  const { isLoading, isError, data } = useQuery({
    queryKey: ["user-settings"],
    queryFn: async () => {
      const res = await fetch("/api/user/settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return await res.json();
    },
  });
  
  // Handle successful data fetching
  useEffect(() => {
    if (data) {
      if (data.firstDayOfWeek) setFirstDay(fromBackendDay(data.firstDayOfWeek));
      if (Array.isArray(data.weekDays)) setWeekDays(fromBackendDays(data.weekDays));
      if (data.birthDate) setBornDate(data.birthDate.split("T")[0]);
      if (typeof data.weight === 'number') setWeight(data.weight);
      if (typeof data.height === 'number') setHeight(data.height);
      if (data.gender) setGender(data.gender);
    }
  }, [data]);

  // PATCH mutation for partial update
  const mutation = useMutation({
    mutationFn: async (payload: Partial<{ firstDayOfWeek: string; weekDays: string[]; birthDate: string; weight: number; gender: string; height: number; }>) => {
      // Validate with zod
      const parsed = SettingsSchema.partial().safeParse(payload);
      if (!parsed.success) throw new Error("Invalid input");
      const requestBody: Record<string, unknown> = {};
      
      // Always include these fields in the request if they are in the payload
      if (payload.firstDayOfWeek) {
        requestBody.firstDayOfWeek = toBackendDay(payload.firstDayOfWeek);
      }
      
      if (payload.weekDays) {
        requestBody.weekDays = toBackendDays(payload.weekDays);
      }
      
      if (payload.birthDate) {
        requestBody.birthDate = payload.birthDate;
      }
      
      // Include weight and height even if they are 0
      if ('weight' in payload) {
        requestBody.weight = payload.weight;
      }
      
      if ('height' in payload) {
        requestBody.height = payload.height;
      }
      
      if (payload.gender) {
        requestBody.gender = payload.gender;
      }
      
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      toast.success(t("settings_saved", "Settings saved successfully!"));
    },
    onError: (err: Error) => {
      toast.error(t("settings_save_error", "Failed to save settings") + (err?.message ? `: ${err.message}` : ""));
    },
    onSettled: () => setSaving(false),
  });

  // UI handlers for PATCH - kept for future use but currently unused
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveFirstDay = () => {
    setSaving(true);
    mutation.mutate({ firstDayOfWeek: firstDay });
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveWeekDays = () => {
    setSaving(true);
    mutation.mutate({ weekDays });
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleSaveBirthDate = () => {
    setSaving(true);
    mutation.mutate({ birthDate: bornDate });
  };

  // Weekday options for UI
  const days = [
    { value: "sunday", label: "Sunday" },
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
  ];

  // Loading and error states

  // Loading and error states
  if (isLoading) { 
    return <div className="p-8 text-center">{t('loading')}</div>; 
  }

  if (isError) { 
    return <div className="p-8 text-center text-red-500">{t('settings_load_error', 'Failed to load settings')}</div>; 
  }

  // Main content
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t('settings_title')}</h1>

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
              <div className="flex items-center gap-2">
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
                
              </div>
              <div className="text-muted-foreground mt-1 text-sm">
                {t('selected')}: {t(`weekday_${firstDay}`)}
              </div>
              <div className="text-muted-foreground text-xs mt-1">
                {t('first_day_desc')}
              </div>
            </div>

            {/* Week Days Selection */}
            <div>
              <div className="mb-2 font-medium">{t('week_days')}</div>
              <div className="space-y-6 max-w-md">
                {/* Reorder days array to start with first day of week */}
                {(() => {
                  const firstDayIndex = days.findIndex(d => d.value === firstDay);
                  const orderedDays = [...days.slice(firstDayIndex), ...days.slice(0, firstDayIndex)];
                  return (
                    <div className="flex justify-between px-1">
                      {orderedDays.map((day) => (
                        <div 
                          key={day.value} 
                          className={`text-xs font-medium ${weekDays.includes(day.value) ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                          {t(`weekday_${day.value}`).slice(0, 3)}
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <div className="pt-8 relative">
                  {/* Day markers - reordered to match first day of week */}
                  {(() => {
                    const firstDayIndex = days.findIndex(d => d.value === firstDay);
                    const orderedDays = [...days.slice(firstDayIndex), ...days.slice(0, firstDayIndex)];
                    return (
                      <div className="flex justify-between w-full absolute top-0">
                        {orderedDays.map((day) => (
                          <div 
                            key={`marker-${day.value}`}
                            className={`h-4 w-1 ${weekDays.includes(day.value) ? 'bg-primary' : 'bg-muted'}`}
                          />
                        ))}
                      </div>
                    );
                  })()}
                  
                  {/* Single slider for number of days */}
                  <Slider
                    value={[weekDays.length]}
                    min={1}
                    max={7}
                    step={1}
                    onValueChange={(values) => {
                      const numDays = values[0];
                      // Always start with first day of week setting and add consecutive days
                      const firstDayIndex = days.findIndex(d => d.value === firstDay);
                      const newWeekDays = [];
                      
                      for (let i = 0; i < numDays; i++) {
                        const dayIndex = (firstDayIndex + i) % 7;
                        newWeekDays.push(days[dayIndex].value);
                      }
                      
                      setWeekDays(newWeekDays);
                    }}
                    className="my-4"
                    data-testid="week-days-slider"
                  />
                  
                  {/* Number display with first day info */}
                  <div className="text-center mt-2">
                    <div className="font-medium text-lg">
                      {weekDays.length} {weekDays.length === 1 ? t('day') : t('days')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t('starting_from')} {t(`weekday_${firstDay}`)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-muted-foreground text-sm">
                    {t('selected')}: {weekDays.map(d => t(`weekday_${d}`)).join(", ")}
                  </div>
                  
                </div>
                <div className="text-muted-foreground text-xs">
                  {t('week_days_desc', 'Select how many days are included in your week.')}
                </div>
              </div>
            </div>
          </div>
          {/* General Settings Save Button */}
          <div className="flex justify-end mt-8">
            <Button
              className="btn btn-primary px-6 py-2 rounded"
              onClick={() => {
                setSaving(true);
                mutation.mutate({ firstDayOfWeek: firstDay, weekDays });
              }}
              disabled={saving}
              data-testid="save-general-settings"
            >
              {saving ? t('saving', 'Saving...') : t('save')}
            </Button>
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
            {/* Birth date and age */}
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
              <div className="flex items-center gap-4">
                <Select
                  value={weight ? String(weight) : ""}
                  onValueChange={val => setWeight(Number(val))}
                  data-testid="weight-input"
                  disabled={saving}
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
            </div>

            {/* Height in cm */}
            <div>
              <label htmlFor="height-cm" className="block font-medium mb-1">{t('height_cm')}</label>
              <Select
                value={height ? String(height) : ""}
                onValueChange={val => setHeight(Number(val))}
                data-testid="height-input"
                disabled={saving}
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
                disabled={saving}
              >
                <ToggleGroupItem value="male" data-testid="gender-male">{t('male')}</ToggleGroupItem>
                <ToggleGroupItem value="female" data-testid="gender-female">{t('female')}</ToggleGroupItem>
                <ToggleGroupItem value="other" data-testid="gender-other">{t('other')}</ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* User Settings Save Button */}
          <div className="flex justify-end mt-8">
            <Button
              className="btn btn-primary px-6 py-2 rounded"
              onClick={() => {
                setSaving(true);
                mutation.mutate({ birthDate: bornDate, weight, height, gender });
              }}
              disabled={saving}
              data-testid="save-user-settings"
            >
              {saving ? t('saving', 'Saving...') : t('save')}
            </Button>
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
