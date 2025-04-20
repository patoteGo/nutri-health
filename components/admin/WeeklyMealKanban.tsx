"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../ui/card";
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
      className="mb-2 bg-white shadow rounded border hover:bg-accent/10 transition select-none"
    >
      <Card className="p-2 flex flex-col justify-between">
        <div className="flex justify-between items-center gap-2 mb-1">
          <span className="font-medium">{menu.name}</span>
        </div>
        {menu.category && (
          <span className="inline-block text-xs rounded bg-muted px-2 py-0.5 mb-1">
            {menu.category}
          </span>
        )}
        {menu.ingredients && menu.ingredients.length > 0 && (
          <ul className="text-xs text-muted-foreground pl-4 list-disc">
            {menu.ingredients.map((ingredient, idx) => (
              <li key={idx}>
                {ingredient.name}
                {ingredient.weight ? ` (${ingredient.weight}g)` : ""}
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
            {weekDays.map((day) => {
                const dayMenus = menusByDay[day] || [];
              
                return (
                  <div key={day} className="flex-1 min-w-[180px]">
                    <div className="text-center text-sm mb-2 font-normal tracking-wide bg-muted rounded-t-lg py-2 shadow-sm border-b border-muted-foreground/10">
                      {t(`weekday_${day}`, day.charAt(0).toUpperCase() + day.slice(1))}
                    </div>
                  
                  {/* Make each day a droppable area */}
                  <Droppable droppableId={day} type="menu">
                    {(provided, snapshot) => {
                      // Log when a day becomes a drop target
                      if (snapshot.isDraggingOver) {
                        console.log(`Dragging over ${day} - isDraggingOver:`, snapshot.isDraggingOver);
                      }
                      
                      return (
                        <div 
                          ref={provided.innerRef}
                          {...provided.droppableProps} 
                          data-droppable-id={day}
                          className={`min-h-[400px] p-3 rounded border-2 transition-colors ${snapshot.isDraggingOver ? "border-primary bg-primary/5 ring-2 ring-primary" : "border-muted/30"}`}
                          style={{ 
                            minHeight: 400,
                            position: 'relative'
                          }}
                        >
                          {/* Show meal type headers and assigned menus */}
                          {mealTypeOrder.map((type) => {
                            // Find menu of this type for this day
                            const typeMenus = dayMenus.filter(m => m.category?.toUpperCase() === type);
                            
                            // Only show if there's a menu of this type
                            return typeMenus.map((menu, index) => (
                              <div key={`${day}-${type}-${menu.id}`} className="mb-3">
                                <div className="text-xs font-semibold mb-1 text-muted-foreground">
                                  {getMealLabel(type, (key, defaultText) => t(key, { defaultValue: defaultText }))}
                                </div>
                                
                                <Draggable draggableId={menu.id} index={index}>
                                  {(provided, snapshot) => {
                                    if (snapshot.isDragging) {
                                      console.log(`Dragging menu ${menu.id} from ${day}`);
                                    }
                                    
                                    return (
                                      <MenuCard 
                                        menu={menu} 
                                        index={index}
                                        provided={provided}
                                      />
                                    );
                                  }}
                                </Draggable>
                              </div>
                            ));
                          })}
                          
                          {/* Drop placeholder */}
                          {provided.placeholder}
                          
                          {/* Visual indicator when dragging over */}
                          {snapshot.isDraggingOver && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="text-center p-3 text-sm text-primary font-medium bg-primary/10 rounded shadow-lg border border-primary">
                                {t('drop_to_add_to_day', 'Solte para adicionar em {{day}}', { day: t(`weekday_${day}`, day.charAt(0).toUpperCase() + day.slice(1)) })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }}
                  </Droppable>
                </div>
              );
            })}
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
