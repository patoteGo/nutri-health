"use client";
import type { Menu } from "@/lib/types";
// Admin dashboard UI for editing weekly meal plans
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import MenuBuilder from "./MenuBuilder";
// Import DragDropContext from hello-pangea/dnd
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../../components/ui/select";
import { getWeekStart } from "../../lib/weekUtils";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import WeeklyMealKanban from "./WeeklyMealKanban";

// Types


// Define weekDays constant for use in drag-and-drop logic
const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function WeeklyMealPlanAdmin() {
  const [menus, setMenus] = useState<Menu[]>([]);

  type MenuPlan = {
    menus: Menu[];
    [key: string]: unknown;
  };

  const { t } = useTranslation();
  const [selectedPerson, setSelectedPerson] = useState<string>("");
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [editPlan, setEditPlan] = useState<unknown>(null);
  
  // Add state to track drag operations for debugging
  const [isDragging, setIsDragging] = useState(false);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [dragDestination, setDragDestination] = useState<string | null>(null);
  
  // Handle all drag operations at the parent level
  const handleDragStart = (start: any) => {
    console.log('PARENT: Drag started', start);
    setIsDragging(true);
    setDragSource(start.source.droppableId);
  };
  
  const handleDragUpdate = (update: any) => {
    if (update.destination) {
      setDragDestination(update.destination.droppableId);
      console.log('PARENT: Dragging over', update.destination.droppableId);
    } else {
      setDragDestination(null);
    }
  };
  
  const handleDragEnd = (result: DropResult) => {
    console.log('PARENT: Drag ended', result);
    setIsDragging(false);
    setDragSource(null);
    setDragDestination(null);
    
    const { destination, source, draggableId } = result;
    
    // If there's no destination, do nothing
    if (!destination) {
      console.warn('PARENT: Drop failed - no destination');
      return;
    }
    
    // If dropped in same place, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      console.log('PARENT: Dropped in same location, no changes needed');
      return;
    }
    
    // Find the dragged menu
    const menu = menus.find(m => m.id === draggableId);
    if (!menu) {
      console.error('PARENT: Menu not found:', draggableId);
      return;
    }
    
    if (!menu.category) {
      console.error('PARENT: Menu has no category:', menu);
      return;
    }
    
    // Get the meal type
    const mealType = menu.category.toUpperCase();
    console.log(`PARENT: Processing drop of menu type ${mealType} to ${destination.droppableId}`);
    
    // If destination is a day column, check if that day already has this meal type
    if (weekDays.includes(destination.droppableId)) {
      const day = destination.droppableId;
      console.log(`PARENT: Dropping into day: ${day}`);
      
      // Check if this day already has this meal type
      const dayMenus = menus.filter(m => m.assignedDay === day);
      const existingMeal = dayMenus.find(m => 
        m.category?.toUpperCase() === mealType && m.id !== menu.id
      );
      
      if (existingMeal) {
        console.warn(`PARENT: Day ${day} already has a ${menu.category}, showing error toast`);
        toast.error(`${day} already has a ${menu.category}`);
        return;
      }
      
      console.log(`PARENT: Updating menu ${menu.id} to be assigned to ${day} as ${mealType}`);
      // Update the menu's assigned day
      const newMenus = menus.map(m => {
        if (m.id === draggableId) {
          return {
            ...m,
            assignedDay: day,
            assignedMoment: mealType
          };
        }
        return m;
      });
      
      console.log('PARENT: Setting new menus state');
      setMenus(newMenus);
    } 
    // If destination is unassigned, remove day assignment
    else if (destination.droppableId === 'unassigned') {
      console.log(`PARENT: Moving menu ${menu.id} to unassigned`);
      const newMenus = menus.map(m => {
        if (m.id === draggableId) {
          const { assignedDay, assignedMoment, ...rest } = m;
          return rest as Menu;
        }
        return m;
      });
      
      console.log('PARENT: Setting new menus state');
      setMenus(newMenus);
    } else {
      console.warn(`PARENT: Unknown drop destination: ${destination.droppableId}`);
    }
  };
  const queryClient = useQueryClient();

  // Fetch people (users)
  const { data: people, isLoading: peopleLoading, error: peopleError } = useQuery<{ id: string; name?: string; email: string }[]>({
    queryKey: ["people"],
    queryFn: async () => {
      const res = await fetch("/api/admin/people");
      if (!res.ok) throw new Error("Failed to fetch users");
      return await res.json();
    },
  });

  // Fetch plan for selected person/week
  const { data: plan } = useQuery<unknown>({
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
    // Use type guard for plan
    if (plan && typeof plan === "object" && plan !== null && 'menus' in plan && Array.isArray((plan as MenuPlan).menus)) {
      setMenus((plan as MenuPlan).menus);
    }
  }, [plan]);

  // Save mutation
  const mutation = useMutation({
    // newPlan type is unknown
mutationFn: async (newPlan: unknown) => {
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
              <SelectValue placeholder={mutation.isPending ? t('saving', 'Saving...') : t('save', 'Save')} />
            </SelectTrigger>
            <SelectContent>
              {peopleLoading && <div className="px-4 py-2 text-muted-foreground">{t('loading', 'Loading...')}</div>}
              {peopleError && <div className="px-4 py-2 text-destructive">{t('error_loading_users', 'Error loading users')}</div>}
              {!peopleLoading && !peopleError && (!people || people.length === 0) && (
                <div className="px-4 py-2 text-muted-foreground">{t('no_users_found', 'No users found')}</div>
              )}
              {people && people.length > 0 && people.map((p) => (
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
          {t('managing_meals_for', 'Managing meals for:')} <span className="font-semibold">{people.find((p) => p.id === selectedPerson)?.name || people.find((p) => p.id === selectedPerson)?.email}</span>
        </div>
      )}
      {/* Debug info */}
      {isDragging && (
        <div className="fixed top-0 left-0 bg-black/80 text-white p-2 text-xs z-50 rounded-br-lg">
          Dragging from: {dragSource || 'unknown'}
          {dragDestination && <> → to: {dragDestination}</>}
        </div>
      )}
      
      {/* Wrap both components in a single DragDropContext */}
      <DragDropContext
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdate}
        onDragEnd={handleDragEnd}
      >
        <section className="mb-6">
          <MenuBuilder 
            menus={menus} 
            onMenusChange={setMenus} 
            personId={selectedPerson} 
            parentIsDragging={isDragging} 
          />
        </section>
        {typeof editPlan === 'object' && editPlan !== null && (
          <WeeklyMealKanban
            menus={menus}
            onMenusChange={setMenus}
            parentIsDragging={isDragging}
          />
        )}
      </DragDropContext>
      <Button
        onClick={() => mutation.mutate({
          person: selectedPerson,
          weekStart: weekStart.toISOString(),
          meals: (editPlan && typeof editPlan === "object" && editPlan !== null && 'meals' in editPlan) ? (editPlan as { meals: unknown }).meals : undefined,
        })}
        disabled={!selectedPerson || !editPlan || mutation.isPending}
      >
        {mutation.isPending ? t('saving', 'Saving...') : t('save', 'Save')}
      </Button>
      {mutation.isError && <div className="text-red-500">{String(t('error_saving_plan', 'Error saving plan'))}</div>}
      {mutation.isSuccess && <div className="text-green-600">{t('saved', 'Saved!')}</div>}
    </div>
  );
}
