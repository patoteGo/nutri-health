"use client";

import React from "react";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { mealMoments } from "@/lib/weekUtils";
import { Card } from "../ui/card";
import { useDroppable } from "@dnd-kit/core";
import DraggableMenuCard from "./DraggableMenuCard";

// --- Zod Menu Schema ---

// --- Props ---
interface WeeklyMealKanbanProps {
  menus: any[];
  onMenusChange: (menus: any[]) => void;
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

// --- Droppable Meal Slot ---
interface DroppableMealSlotProps {
  day: string;
  mealMoment: string;
  menus: any[];
}

const DroppableMealSlot: React.FC<DroppableMealSlotProps> = React.memo(({ day, mealMoment, menus }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `${day}|${mealMoment}`,
    data: { day, mealMoment },
  });
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col gap-2 px-3 pb-3 min-h-[30px] transition-all rounded-md ${isOver ? "ring-2 ring-primary/70 bg-primary/5" : ""}`}
    >
      {menus.length === 0 ? (
        <span className="text-xs text-muted-foreground opacity-60 italic select-none">Empty</span>
      ) : (
        menus.map((menu) => (
          <DraggableMenuCard key={menu.id} menu={menu} day={day} mealMoment={mealMoment} />
        ))
      )}
    </div>
  );
});

DroppableMealSlot.displayName = "DroppableMealSlot";

// --- Main Kanban Component ---
const WeeklyMealKanban: React.FC<WeeklyMealKanbanProps> = ({ menus, onMenusChange }) => {
  // --- Memoized board: always reflects latest menus ---
  const board = React.useMemo(() => {
    const initial: Record<string, Record<string, Menu[]>> = {};
    weekDays.forEach((day) => {
      initial[day] = {};
      mealMoments.forEach((moment) => {
        initial[day][moment] = [];
      });
    });
    menus.forEach((menu) => {
      if (menu.assignedDay && menu.assignedMoment) {
        if (initial[menu.assignedDay] && initial[menu.assignedDay][menu.assignedMoment]) {
          initial[menu.assignedDay][menu.assignedMoment].push(menu);
        }
      }
    });
    return initial;
  }, [menus]);

  // --- Drag/Drop Handlers ---
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over) return;
    // Parse IDs
    const [menuId, fromDay, fromMoment] = active.id.toString().split("|");
    // If dropped over Menus list (unassigned), over.id === 'unassigned'
    if (over.id === 'unassigned') {
      // Remove assignment
      const menu = menus.find(m => m.id === menuId);
      if (!menu) return;
      const newMenus = menus.map(m => m.id === menuId ? { ...m, assignedDay: undefined, assignedMoment: undefined } : m);
      onMenusChange(newMenus);
      return;
    }
    const [toDay, toMoment] = over.id.toString().split("|");
    // Only allow drop if mealMoment matches menu's category
    const menu = menus.find(m => m.id === menuId);
    if (!menu || menu.category.toUpperCase() !== toMoment) return;
    if (menu.assignedDay === toDay && menu.assignedMoment === toMoment) return;
    // Update assignment
    const newMenus = menus.map(m => m.id === menuId ? { ...m, assignedDay: toDay, assignedMoment: toMoment } : m);
    onMenusChange(newMenus);
    setBoard(prev => {
      const newBoard = JSON.parse(JSON.stringify(prev));
      if (menu.assignedDay && menu.assignedMoment) {
        newBoard[menu.assignedDay][menu.assignedMoment] = newBoard[menu.assignedDay][menu.assignedMoment].filter(m => m.id !== menuId);
      }
      newBoard[toDay][toMoment].push({ ...menu, assignedDay: toDay, assignedMoment: toMoment });
      return newBoard;
    });
  }

  return (
    <div className="overflow-x-auto">
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
                      <DroppableMealSlot
                        day={day}
                        mealMoment={moment}
                        menus={board[day][moment]}
                        onDropMenu={(menuId, fromDay, fromMoment) => {
                          // Only allow drop if mealMoment matches menu's category
                          const menu = board[fromDay][fromMoment].find(m => m.id === menuId);
                          if (!menu || menu.category.toUpperCase() !== moment) return;
                          // Remove from old slot
                          const newBoard = JSON.parse(JSON.stringify(board));
                          newBoard[fromDay][fromMoment] = newBoard[fromDay][fromMoment].filter(m => m.id !== menuId);
                          // Add to new slot
                          newBoard[day][moment].push(menu);
                          
                          // Flatten board to menus array for parent
                          const newMenus = Object.values(newBoard).flatMap(dayObj => Object.values(dayObj).flat());
                          onMenusChange(newMenus);
                        }}
                      />
                    </SortableContext>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
    </div>
  );
};

WeeklyMealKanban.displayName = "WeeklyMealKanban";
export default WeeklyMealKanban;
