"use client";
// Admin dashboard UI for editing weekly meal plans
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import { Select, SelectItem, SelectContent } from "../../components/ui/select";
import { getWeekStart, getWeekDays, mealMoments } from "../../lib/weekUtils";
import { WeeklyMealPlanSchema, MealMoment } from "../../lib/types";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Types
interface WeeklyMealPlanAdminProps {
  userEmail: string;
}

export default function WeeklyMealPlanAdmin({ userEmail }: WeeklyMealPlanAdminProps) {
  const { data: session } = useSession();
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [editPlan, setEditPlan] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch people (users)
  const { data: people } = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const res = await fetch("/api/admin/people");
      return await res.json();
    },
  });

  // Fetch plan for selected person/week
  const { data: plan, refetch } = useQuery({
    queryKey: ["weeklyMealPlan", selectedPerson, weekStart.toISOString()],
    queryFn: async () => {
      if (!selectedPerson) return null;
      const res = await fetch(
        `/api/admin/weekly-meal-plan?person=${selectedPerson}&weekStart=${weekStart.toISOString()}`
      );
      return await res.json();
    },
    enabled: !!selectedPerson,
  });

  useEffect(() => {
    setEditPlan(plan);
  }, [plan]);

  // Save mutation
  const mutation = useMutation({
    mutationFn: async (newPlan: any) => {
      const res = await fetch("/api/admin/weekly-meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPlan),
      });
      if (!res.ok) throw new Error("Failed to save");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weeklyMealPlan"] });
    },
  });

  // UI rendering
  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin: Weekly Meal Plan</h1>
      <div className="flex gap-4 mb-4">
        <Select value={selectedPerson} onValueChange={setSelectedPerson} placeholder="Select person">
          <SelectContent>
            {people?.map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.name || p.email}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {/* Week picker could be improved */}
        <input
          type="date"
          value={weekStart.toISOString().slice(0, 10)}
          onChange={e => setWeekStart(new Date(e.target.value))}
        />
      </div>
      {editPlan && (
        <table className="w-full border mb-4">
          <thead>
            <tr>
              <th>Day</th>
              {mealMoments.map((moment: MealMoment) => (
                <th key={moment}>{moment}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getWeekDays(weekStart).map(day => (
              <tr key={day.toISOString()}>
                <td>{day.toLocaleDateString()}</td>
                {mealMoments.map((moment: MealMoment) => (
                  <td key={moment}>
                    <input
                      className="border px-2 py-1 w-full"
                      value={editPlan.meals?.[day.toISOString()]?.[moment]?.parts?.[0]?.name || ""}
                      onChange={e => {
                        setEditPlan((prev: any) => {
                          const newPlan = { ...prev };
                          newPlan.meals = newPlan.meals || {};
                          newPlan.meals[day.toISOString()] = newPlan.meals[day.toISOString()] || {};
                          newPlan.meals[day.toISOString()][moment] = newPlan.meals[day.toISOString()][moment] || { parts: [{}] };
                          newPlan.meals[day.toISOString()][moment].parts[0].name = e.target.value;
                          return newPlan;
                        });
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Button
        onClick={() => mutation.mutate({
          person: selectedPerson,
          weekStart: weekStart.toISOString(),
          meals: editPlan.meals,
        })}
        disabled={!selectedPerson || !editPlan || mutation.isLoading}
      >
        Save
      </Button>
      {mutation.isError && <div className="text-red-500">Error saving plan</div>}
      {mutation.isSuccess && <div className="text-green-600">Saved!</div>}
    </div>
  );
}
