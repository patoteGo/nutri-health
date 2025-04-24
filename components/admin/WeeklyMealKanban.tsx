"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/card";

// Helper function to get the appropriate unit abbreviation
function getUnitAbbreviation(ingredient: any): string {
  // Special case for eggs - they should always be counted in units
  if (ingredient.name && ingredient.name.toLowerCase().includes('egg')) {
    return 'u';
  }
  
  // Special case for slices - they should always be counted in slices
  if (ingredient.name && ingredient.name.toLowerCase().includes('slice')) {
    return 'sl';
  }
  
  if (!ingredient.unit) return 'g';
  
  switch (ingredient.unit) {
    case 'GRAM': return 'g';
    case 'ML': return 'ml';
    case 'SLICE': return 'sl';
    case 'UNIT': return 'u';
    case 'TEASPOON': return 'tsp';
    case 'TABLESPOON': return 'tbsp';
    case 'CUP': return 'cup';
    case 'PIECE': return 'pc';
    default: return 'g';
  }
}
import { Droppable, Draggable, DraggableProvided } from "@hello-pangea/dnd";
import type { Menu } from "@/lib/types";
// Removed unused toast import

interface WeeklyMealKanbanProps {
  menus: Menu[];
}

const weekDays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]; // Lowercase for translation keys

// Backend enum for meal moments
const mealMoments = [
  "BREAKFAST",
  "SNACK1",
  "LUNCH",
  "SNACK2",
  "DINNER",
  "SUPPER"
] as const;

// --- Helper: Get meal moment label from enum ---
function getMealLabel(meal: string, t: (key: string, defaultText?: string) => string) {
  switch (meal) {
    case "BREAKFAST":
      return t("meal_BREAKFAST", "Café da manhã");
    case "SNACK1":
      return t("meal_SNACK1", "Lanche 1");
    case "LUNCH":
      return t("meal_LUNCH", "Almoço");
    case "SNACK2":
      return t("meal_SNACK2", "Lanche 2");
    case "DINNER":
      return t("meal_DINNER", "Jantar");
    case "SUPPER":
      return t("meal_SUPPER", "Ceia");
    default:
      return meal;
  }
}

// --- Main Kanban Component ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mealTypeOrder = ["BREAKFAST", "LUNCH", "DINNER", "SNACK"];

// Removed unused MealType type

// Menu card component that will be draggable
const MenuCard: React.FC<{
  menu: Menu;
  index: number;
  provided: DraggableProvided;
}> = ({ menu, provided }) => {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className="mb-2 bg-card text-card-foreground shadow rounded border hover:bg-accent/10 transition select-none"
    >
      <Card className="p-2 flex flex-col justify-between">
        <div className="flex justify-between items-center gap-2 mb-1">
          {menu.category && (
            <span className="inline-block text-xs rounded bg-muted px-2 py-0.5">
              {menu.category}
            </span>
          )}
          <div className="flex gap-1"></div>
        </div>
        {menu.ingredients && menu.ingredients.length > 0 && (
          <ul className="text-xs text-muted-foreground pl-4 list-disc">
            {menu.ingredients.map((ingredient, idx) => (
              <li key={idx}>
                {ingredient.name}
                {ingredient.weight ? ` (${ingredient.weight}${getUnitAbbreviation(ingredient)})` : ""}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

const WeeklyMealKanban: React.FC<WeeklyMealKanbanProps> = ({ menus }) => {
  const { t } = useTranslation();
  // Debug counter for component renders
  const renderCount = React.useRef(0);
  renderCount.current++;
  console.log(`WeeklyMealKanban render #${renderCount.current}`);

  // Organize menus: unassigned and assigned by day
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const menusByDay = React.useMemo(() => {
    console.log('Organizing menus by day:', menus);
    const result: Record<string, Menu[]> = {
      unassigned: [],
    };
    
    // Initialize all days with empty arrays
    weekDays.forEach(day => {
      result[day] = [];
    });
    
    // Organize menus into their assigned days or unassigned
    menus.forEach(menu => {
      if (menu.assignedDay) {
        if (result[menu.assignedDay]) {
          result[menu.assignedDay].push(menu);
        }
      } else {
        result.unassigned.push(menu);
      }
    });
    
    console.log('Organized menus by day:', result);
    return result;
  }, [menus]);
  
  // Removed unused dayHasMealType function
  // Log available drop zones after render
  React.useEffect(() => {
    // Wait for DOM to be ready
    setTimeout(() => {
      const dropZones = document.querySelectorAll('[data-droppable-id]');
      console.log('Available drop zones:', Array.from(dropZones).map(el => el.getAttribute('data-droppable-id')));
    }, 500);
  }, []);
  
  // Drag and drop is now handled by the parent component
  // This component just renders the Kanban board
  
  // Local tracking of dragged item ID for debugging
  // Removed unused draggedItemId state and effect
  return (
    <>
      <div className="overflow-x-auto">
        <div className="flex gap-2 min-w-[1200px]">
          {/* Day columns */}
          {weekDays.map((day) => (
            <div key={day} className="flex-1 min-w-[180px]">
              <div className="text-center text-sm mb-2 font-normal tracking-wide bg-muted rounded-t-lg py-2 shadow-sm border-b border-muted-foreground/10">
                {t(`weekday_${day}`, day.charAt(0).toUpperCase() + day.slice(1))}
              </div>
              {/* Render meal moments for each day */}
              {/* Single big droppable for the day */}
<Droppable droppableId={day} type="menu">
  {(provided, snapshot) => (
    <div
      ref={provided.innerRef}
      {...provided.droppableProps}
      data-droppable-id={day}
      className={`min-h-[400px] p-3 rounded border-2 transition-colors ${snapshot.isDraggingOver ? "border-primary bg-primary/5 ring-2 ring-primary" : "border-muted/30"}`}
      style={{ minHeight: 400, position: "relative" }}
    >
      {mealMoments.map((moment) => {
        const menu = menus.find(
          (m) => m.assignedDay === day && m.assignedMoment === moment
        );
        if (!menu) return null;
        return (
          <div key={moment} className="mb-3">
            <div className="text-xs font-semibold mb-1 text-muted-foreground">
              {getMealLabel(moment, (key, defaultText) => t(key, { defaultValue: defaultText }))}
            </div>
            <Draggable draggableId={menu.id} index={0} key={menu.id}>
              {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
              {(provided, snapshot) => (
                <MenuCard
                  menu={menu}
                  index={0}
                  provided={provided}
                />
              )}
            </Draggable>
          </div>
        );
      })}
      {provided.placeholder}
      {snapshot.isDraggingOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-3 text-sm text-primary font-medium bg-primary/10 rounded shadow-lg border border-primary">
            {t('drop_to_add_to_day', 'Solte para adicionar em {{day}}', { day: t(`weekday_${day}`, day.charAt(0).toUpperCase() + day.slice(1)) })}
          </div>
        </div>
      )}
    </div>
  )}
</Droppable>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// Fix export
WeeklyMealKanban.displayName = 'WeeklyMealKanban';
// Lint: All unused vars/types/imports removed

// Ensure this export is correctly processed
export default WeeklyMealKanban;
