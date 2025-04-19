"use client";
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card } from "../ui/card";

import { Button } from "../ui/button";

interface DraggableMenuCardProps {
  menu: {
    id: string;
    name: string;
    category?: string;
    ingredients?: { name: string; weight?: number }[];
  };
  day: string;
  mealMoment: string;
  onDelete?: () => void;
}

const DraggableMenuCard: React.FC<DraggableMenuCardProps> = ({ menu, day, mealMoment, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${menu.id}|${day}|${mealMoment}`,
    data: { menuId: menu.id, day, mealMoment },
  });

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 1,
        cursor: "grab",
      }}
      className={
        "p-2 bg-white shadow border hover:bg-accent transition select-none relative" +
        (isDragging ? " ring-2 ring-primary" : "")
      }
    >
      <div className="flex justify-between items-center gap-2 mb-1">
        <span className="font-medium">{menu.name}</span>
        {onDelete && (
          <Button
            size="icon"
            variant="ghost"
            aria-label="Delete menu"
            title="Delete menu"
            className="text-destructive hover:bg-destructive/10"
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
          </Button>
        )}
      </div>
      {menu.category && (
        <span className="inline-block text-xs rounded bg-muted px-2 py-0.5 mb-1">
          {menu.category}
        </span>
      )}
      {menu.ingredients && menu.ingredients.length > 0 && (
        <ul className="text-xs text-muted-foreground ml-2">
          {menu.ingredients.map((ing, idx) => (
            <li key={idx}>{ing.name}{ing.weight ? ` — ${ing.weight}g` : ""}</li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default DraggableMenuCard;
