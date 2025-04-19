// LanguageSwitcher is now globally available via Header (layout.tsx)
"use client";
import React from "react";
import { useState, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ImageUploadButton } from "@/components/ui/image-upload-button";
import clsx from "clsx";

// Mock data for selectors (replace with real data fetching later)
const people = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
];
const meals = [
  { id: "breakfast", label: "Breakfast" },
  { id: "snack1", label: "Snack 1" },
  { id: "lunch", label: "Lunch" },
  { id: "snack2", label: "Snack 2" },
  { id: "dinner", label: "Dinner" },
  { id: "supper", label: "Supper" },
];
const mealOptions = [1, 2, 3];

// Generate current week and next 3 weeks
function getWeekOptions() {
  const now = new Date();
  const weeks = [];
  for (let i = 0; i < 4; i++) {
    const start = new Date(now);
    start.setDate(now.getDate() + i * 7 - now.getDay()); // Sunday
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Saturday
    weeks.push({
      id: `${start.toISOString().slice(0, 10)}_${end.toISOString().slice(0, 10)}`,
      label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
    });
  }
  return weeks;
}

export default function LogMealPage() {
  // # Reason: Initialize with empty string for controlled components to avoid uncontrolled->controlled warning.
  // # i18n: All UI strings use t('key', 'Fallback') for translation.
  const { t } = useTranslation();
  const [person, setPerson] = useState<string>('');
  const [meal, setMeal] = useState<string>('');
  const [week, setWeek] = useState<string>('');
  // Option remains undefined initially, but we'll handle its conversion to string for the Select value.
  const [option, setOption] = useState<number | undefined>();

  const weekOptions = getWeekOptions();

  return (
    <main className="max-w-md mx-auto p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-4">{t('log_meal_title', 'Log a Meal')}</h1>

      {/* Select Person */}
      <div>
        <label className="block mb-1 text-sm font-medium">{t('select_person', 'Select Person')}</label>
        <Select value={person} onValueChange={setPerson}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('choose_person', 'Choose a person')} />
          </SelectTrigger>
          <SelectContent>
            {people.map((p) => (
              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Select Meal */}
      <div>
        <label className="block mb-1 text-sm font-medium">{t('select_meal', 'Select Meal')}</label>
        <Select value={meal} onValueChange={setMeal}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('choose_meal', 'Choose a meal')} />
          </SelectTrigger>
          <SelectContent>
            {meals.map((m) => (
              <SelectItem key={m.id} value={m.id}>{t(`meal_${m.id}`, m.label)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Select Week */}
      <div>
        <label className="block mb-1 text-sm font-medium">{t('select_week', 'Select Week')}</label>
        <Select value={week} onValueChange={setWeek}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('choose_week', 'Choose a week')} />
          </SelectTrigger>
          <SelectContent>
            {weekOptions.map((w) => (
              <SelectItem key={w.id} value={w.id}>{w.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Meal Option */}
      <div>
        <label className="block mb-1 text-sm font-medium">{t('meal_option', 'Meal Option')}</label>
        {/* # Reason: Ensure value passed is always string or empty string */}
        <Select value={option?.toString() ?? ''} onValueChange={(v) => setOption(Number(v))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('choose_option', 'Choose option')} />
          </SelectTrigger>
          <SelectContent>
            {mealOptions.map((o) => (
              <SelectItem key={o} value={o.toString()}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Meal Parts List */}
      <div>
        <label className="block mb-2 text-lg font-semibold">{t('meal_parts', 'Meal Parts')}</label>
        <MealPartsList />
      </div>
    </main>
  );
}

// --- MealPartsList Component ---
type MealPart = {
  name: string;
  grams: string;
  image?: File;
  imageUrl?: string;
};

function MealPartsList() {
  const { t } = useTranslation();
  const [parts, setParts] = useState<MealPart[]>([
    { name: '', grams: '', image: undefined, imageUrl: undefined },
  ]);

  // Handle input changes for name/grams
  const handleChange = (idx: number, field: keyof MealPart, value: string | File) => {
    setParts((prev) =>
      prev.map((part, i) => {
        if (i !== idx) return part;
        if (field === 'image' && value instanceof File) {
          return { ...part, image: value, imageUrl: URL.createObjectURL(value) };
        }
        return { ...part, [field]: value };
      })
    );
  };

  // Add a new meal part row
  const addRow = () => {
    setParts((prev) => [...prev, { name: '', grams: '', image: undefined, imageUrl: undefined }]);
  };

  return (
    <div className="flex flex-col gap-4">
      {parts.map((part, idx) => (
        <div key={idx} className="flex gap-2 items-center bg-card rounded-md p-2 shadow-xs">
          {/* Name Input */}
          <div className="w-full">
            <label className="block text-xs mb-1">{t('food_name', 'Name')}</label>
            <Input
              type="text"
              value={part.name}
              onChange={(e) => handleChange(idx, 'name', e.target.value)}
              placeholder={t('food_name_ph', 'e.g. Chicken Breast')}
              aria-label={t('food_name', 'Name')}
            />
          </div>
          {/* Grams Input */}
          <div className="w-36">
            <label className="block text-xs mb-1">{t('grams', 'Grams')}</label>
            <Input
              type="number"
              min={0}
              value={part.grams}
              onChange={(e) => handleChange(idx, 'grams', e.target.value)}
              placeholder={t('grams_ph', 'g')}
              aria-label={t('grams', 'Grams')}
            />
          </div>
          {/* Image Input */}
          <div className="flex flex-col items-center">
            <label className="block text-xs mb-1">{t('image', 'Image')}</label>
            <ImageUploadButton
              onChange={(file) => handleChange(idx, 'image', file)}
              aria-label={t('image', 'Image')}
              imageUrl={part.imageUrl}
              buttonLabel={t('image', 'Image')}
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        className="mt-2 px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition"
        onClick={addRow}
        data-testid="add-meal-part"
      >
        {t('add_meal_part', 'Add Meal Part')}
      </button>
    </div>
  );
}
