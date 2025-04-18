"use client";
import React from "react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [person, setPerson] = useState<string>('');
  const [meal, setMeal] = useState<string>('');
  const [week, setWeek] = useState<string>('');
  // Option remains undefined initially, but we'll handle its conversion to string for the Select value.
  const [option, setOption] = useState<number | undefined>();

  const weekOptions = getWeekOptions();

  return (
    <main className="max-w-md mx-auto p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-bold mb-4">Log a Meal</h1>

      {/* Select Person */}
      <div>
        <label className="block mb-1 text-sm font-medium">Select Person</label>
        <Select value={person} onValueChange={setPerson}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a person" />
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
        <label className="block mb-1 text-sm font-medium">Select Meal</label>
        <Select value={meal} onValueChange={setMeal}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a meal" />
          </SelectTrigger>
          <SelectContent>
            {meals.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Select Week */}
      <div>
        <label className="block mb-1 text-sm font-medium">Select Week</label>
        <Select value={week} onValueChange={setWeek}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose week" />
          </SelectTrigger>
          <SelectContent>
            {weekOptions.map((w) => (
              <SelectItem key={w.id} value={w.id}>{w.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Select Meal Option */}
      <div>
        <label className="block mb-1 text-sm font-medium">Meal Option</label>
        {/* # Reason: Ensure value passed is always string or empty string */}
        <Select value={option?.toString() ?? ''} onValueChange={(v) => setOption(Number(v))}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose option" />
          </SelectTrigger>
          <SelectContent>
            {mealOptions.map((o) => (
              <SelectItem key={o} value={o.toString()}>{o}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </main>
  );
}
