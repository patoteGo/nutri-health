"use client";

import React from "react";
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
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* General Settings Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* First Day of the Week */}
          <div className="mb-6">
            <div className="mb-2 font-medium">First day of the week</div>
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
                  aria-label={day.label}
                  data-testid={`first-day-toggle-${day.value}`}
                  className="capitalize"
                >
                  {day.label.slice(0, 3)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="text-muted-foreground mt-1 text-sm">
              Selected: {days.find(d => d.value === firstDay)?.label}
            </div>
            <div className="text-muted-foreground text-xs mt-1">
              This will be the day to start your planning on the diet.
            </div>
          </div>

          {/* Days in a Week */}
          <div className="mb-2">
            <div className="mb-2 font-medium">Days in a week</div>
            <div data-testid="days-in-week-slider" className="flex items-center gap-4">
              <Slider
                min={1}
                max={7}
                step={1}
                value={[daysInWeek]}
                onValueChange={([val]) => setDaysInWeek(val)}
                className="w-48"
                aria-label="Days in a week"
              />
              <span className="text-muted-foreground">
                {daysInWeek} {daysInWeek === 1 ? "day" : "days"}
              </span>
            </div>
            <div className="text-muted-foreground text-xs mt-1">
              These are the days you are committed to your diet.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Settings</CardTitle>
          <div className="text-muted-foreground">
            Manage your account settings and preferences
          </div>
        </CardHeader>
        <CardContent>
          {/* Born date and age */}
          <div className="mb-4">
            <label htmlFor="born-date" className="block font-medium mb-1">Born date</label>
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
                placeholderText="Pick your birth date"
                className="input input-bordered"
                data-testid="born-date-input"
                isClearable
              />
              <span className="text-muted-foreground text-sm" data-testid="age-value">
                Age: {bornDate ? calculateAge(bornDate) : '--'}
              </span>
            </div>
          </div>

          {/* Current weight */}
          <div className="mb-4">
            <label htmlFor="current-weight" className="block font-medium mb-1">Current weight (kg)</label>
            <Select
              value={weight ? String(weight) : ""}
              onValueChange={val => setWeight(Number(val))}
              data-testid="weight-input"
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select weight" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(171)].map((_, i) => {
                  const val = i + 30;
                  return (
                    <SelectItem key={val} value={String(val)}>{val} kg</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Height in cm */}
          <div className="mb-4">
            <label htmlFor="height-cm" className="block font-medium mb-1">Height (cm)</label>
            <Select
              value={height ? String(height) : ""}
              onValueChange={val => setHeight(Number(val))}
              data-testid="height-input"
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select height" />
              </SelectTrigger>
              <SelectContent>
                {[...Array(151)].map((_, i) => {
                  const val = i + 100;
                  return (
                    <SelectItem key={val} value={String(val)}>{val} cm</SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Gender */}
          <div className="mb-4">
            <label className="block font-medium mb-1">Gender</label>
            <ToggleGroup
              type="single"
              value={gender}
              onValueChange={val => val && setGender(val)}
              className="flex gap-2"
              data-testid="gender-toggle-group"
            >
              <ToggleGroupItem value="male" data-testid="gender-male">Male</ToggleGroupItem>
              <ToggleGroupItem value="female" data-testid="gender-female">Female</ToggleGroupItem>
              <ToggleGroupItem value="other" data-testid="gender-other">Other</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <p className="text-muted-foreground">
            Settings configuration will be available soon.
          </p>
          
          {session?.user && (
            <div className="mt-4">
              <p><strong>Email:</strong> {session.user.email}</p>
              {session.user.name && <p><strong>Name:</strong> {session.user.name}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
