"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();

  // General settings state
  const [firstDay, setFirstDay] = useState<string>("monday");
  const [daysInWeek, setDaysInWeek] = useState<number>(7);

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
