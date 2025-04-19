"use client";

import React from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { z } from "zod";
import { mealMoments } from "@/lib/weekUtils";
import { Card } from "../ui/card";
import { WeeklyMealPlanSchema, MealMoment } from "@/lib/types";

// --- Zod Menu Schema ---
const MenuSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(), // Should match MealMoment
  personId: z.string(),
  ingredients: z.array(z.any()), // Simplified for now
});

export type Menu = z.infer<typeof MenuSchema>;

// --- Props ---
interface WeeklyMealKanbanProps {
  menus: Menu[];
  weekStart: Date;
  onMenusChange: (menus: Menu[]) => void;
}

const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// --- Helper: Get meal moment label from enum ---
function getMealLabel(meal: string) {
  switch (meal) {
    case "BREAKFAST":
      return "Breakfast";
    case "SNACK1":
      return "Snack 1";
    case "LUNCH":
      return "Lunch";
    case "SNACK2":
      return "Snack 2";
    case "DINNER":
      return "Dinner";
    case "SUPPER":
      return "Supper";
    default:
      return meal;
  }
}

// --- Main Kanban Component ---
const WeeklyMealKanban: React.FC<WeeklyMealKanbanProps> = ({ menus, weekStart, onMenusChange }) => {
  // --- State: Track menu placement per day/meal ---
  // Structure: { [dayIndex]: { [mealMoment]: Menu[] } }
  const [board, setBoard] = React.useState(() => {
    const initial: Record<string, Record<string, Menu[]>> = {};
    weekDays.forEach((day, dIdx) => {
      initial[day] = {};
      mealMoments.forEach((moment) => {
        initial[day][moment] = [];
      });
    });
    // Place existing menus (if any) into correct slot
    menus.forEach((menu) => {
      // Assume menu has day and category (mealMoment)
      // For demo, randomly assign to first day
      const day = weekDays[0];
      const moment = menu.category.toUpperCase();
      if (initial[day][moment]) {
        initial[day][moment].push(menu);
      }
    });
    return initial;
  });

  // --- Drag/Drop Handlers ---
  function handleDragEnd(event: DragEndEvent) {
    // # Reason: Only allow drop if meal type matches
    // TODO: Implement logic to move menu between columns/rows
    // For now, do nothing
  }

  return (
    <div className="overflow-x-auto">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 min-w-[1200px]">
          {weekDays.map((day) => (
            <div key={day} className="flex-1 min-w-[180px]">
              <div className="font-bold text-center mb-4 text-lg tracking-wide uppercase bg-muted rounded-t-lg py-2 shadow-sm border-b border-muted-foreground/10">
                {day}
              </div>
              <div className="flex flex-col gap-4">
                {mealMoments.map((moment) => (
                  <Card key={moment} className="mb-2 min-h-[80px] bg-background border-muted/60 shadow-sm flex flex-col justify-between">
                    <div className="text-xs font-semibold mb-2 px-3 pt-2 text-muted-foreground tracking-wide">
                      {getMealLabel(moment)}
                    </div>
                    <SortableContext
                      items={board[day][moment].map((m) => m.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="flex flex-col gap-2 px-3 pb-3 min-h-[30px]">
                        {board[day][moment].length === 0 ? (
                          <span className="text-xs text-muted-foreground opacity-60 italic select-none">Empty</span>
                        ) : (
                          board[day][moment].map((menu) => (
                            <Card key={menu.id} className="p-2 bg-white shadow border cursor-move hover:bg-accent transition">
                              <div className="font-medium">{menu.name}</div>
                            </Card>
                          ))
                        )}
                      </div>
                    </SortableContext>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DndContext>
    </div>
  );
};

export default WeeklyMealKanban;
