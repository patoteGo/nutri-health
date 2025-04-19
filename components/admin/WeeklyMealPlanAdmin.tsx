"use client";
// Admin dashboard UI for editing weekly meal plans
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { Button } from "../../components/ui/button";
import MenuBuilder from "./MenuBuilder";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../../components/ui/select";
import { getWeekStart, getWeekDays, mealMoments } from "../../lib/weekUtils";
import { WeeklyMealPlanSchema, MealMoment } from "../../lib/types";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import WeeklyMealKanban from "./WeeklyMealKanban";

// Types
interface WeeklyMealPlanAdminProps {
  userEmail: string;
}

export default function WeeklyMealPlanAdmin({ userEmail }: WeeklyMealPlanAdminProps) {
  // ...existing code
  const [menus, setMenus] = useState<any[]>([]);

  // Drag-and-drop handler for both MenuBuilder and Kanban
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over) return;
    const [menuId, fromDay, fromMoment] = active.id.toString().split("|");
    // If dropped over Menus list (unassigned), over.id === 'unassigned'
    if (over.id === 'unassigned') {
      const menu = menus.find(m => m.id === menuId);
      if (!menu) return;
      const newMenus = menus.map(m => m.id === menuId ? { ...m, assignedDay: undefined, assignedMoment: undefined } : m);
      setMenus(newMenus);
      return;
    }
    const [toDay, toMoment] = over.id.toString().split("|");
    const menu = menus.find(m => m.id === menuId);
    if (!menu || menu.category?.toUpperCase() !== toMoment) return;
    if (menu.assignedDay === toDay && menu.assignedMoment === toMoment) return;
    const newMenus = menus.map(m => m.id === menuId ? { ...m, assignedDay: toDay, assignedMoment: toMoment } : m);
    setMenus(newMenus);
  }
  const { t } = useTranslation();
  const { data: session } = useSession();
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [editPlan, setEditPlan] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch people (users)
  const { data: people, isLoading: peopleLoading, error: peopleError } = useQuery({
    queryKey: ["people"],
    queryFn: async () => {
      const res = await fetch("/api/admin/people");
      if (!res.ok) throw new Error("Failed to fetch users");
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
    if (plan && plan.menus) {
      setMenus(plan.menus);
    }
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
      <h1 className="text-2xl font-bold mb-4">{t('admin_weekly_meal_plan', 'Admin: Weekly Meal Plan')}</h1>
      <div className="flex gap-4 mb-4 items-end">
        <div className="flex flex-col w-64">
          <label htmlFor="person-select" className="mb-1 text-sm font-medium">{t('select_person', 'Select person')}</label>
          <Select value={selectedPerson} onValueChange={setSelectedPerson} disabled={peopleLoading || !!peopleError || !people?.length}>
            <SelectTrigger className="w-full" id="person-select">
              <SelectValue placeholder={peopleLoading ? t('loading', 'Loading...') : peopleError ? t('error_loading_users', 'Error loading users') : t('choose_person', 'Select person')} />
            </SelectTrigger>
            <SelectContent>
              {peopleLoading && <div className="px-4 py-2 text-muted-foreground">{t('loading', 'Loading...')}</div>}
              {peopleError && <div className="px-4 py-2 text-destructive">{t('error_loading_users', 'Error loading users')}</div>}
              {!peopleLoading && !peopleError && (!people || people.length === 0) && (
                <div className="px-4 py-2 text-muted-foreground">{t('no_users_found', 'No users found')}</div>
              )}
              {people && people.length > 0 && people.map((p: any) => (
                <SelectItem key={p.id} value={p.id}>{p.name || p.email}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Week picker could be improved */}
        <div className="flex flex-col">
          <label htmlFor="week-picker" className="mb-1 text-sm font-medium">{t('week_start', 'Week start')}</label>
          <input
            id="week-picker"
            type="date"
            value={weekStart.toISOString().slice(0, 10)}
            onChange={e => setWeekStart(new Date(e.target.value))}
            className="border rounded px-2 py-1"
          />
        </div>
      </div>
      {selectedPerson && people && (
        <div className="mb-4 text-base">
          {t('managing_meals_for', 'Managing meals for:')} <span className="font-semibold">{people.find((p: any) => p.id === selectedPerson)?.name || people.find((p: any) => p.id === selectedPerson)?.email}</span>
        </div>
      )}
      {/* Menu Builder */}
      <DndContext onDragEnd={handleDragEnd}>
        <section className="mb-6">
          <MenuBuilder menus={menus} onMenusChange={setMenus} personId={selectedPerson} />
        </section>
        {editPlan && (
          <WeeklyMealKanban
            menus={menus}
            weekStart={weekStart}
            onMenusChange={setMenus}
          />
        )}
      </DndContext>
      <Button
        onClick={() => mutation.mutate({
          person: selectedPerson,
          weekStart: weekStart.toISOString(),
          meals: editPlan.meals,
        })}
        disabled={!selectedPerson || !editPlan || mutation.isLoading}
      >
        {t('save', 'Save')}
      </Button>
      {mutation.isError && <div className="text-red-500">{t('error_saving_plan', 'Error saving plan')}</div>}
      {mutation.isSuccess && <div className="text-green-600">{t('saved', 'Saved!')}</div>}
    </div>
  );
}
