"use client";
import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose
} from "../ui/dialog";
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

const DraggableMenuCard: React.FC<DraggableMenuCardProps> = React.memo(({ menu, day, mealMoment, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: menu.id, // Simplify ID to just the menu ID, this is what handleDragEnd expects
    data: { menuId: menu.id, day, mealMoment },
  });

  // Add debugging for drag state
  React.useEffect(() => {
    if (isDragging) {
      console.log('Dragging menu:', { 
        id: menu.id, 
        name: menu.name, 
        category: menu.category,
        from: { day, mealMoment }
      });
    }
  }, [isDragging, menu, day, mealMoment]);

  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex items-start gap-1">
      <Card
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
          opacity: isDragging ? 0.5 : 1,
          zIndex: isDragging ? 100 : 1,
          cursor: "grab",
          touchAction: "none", // Required for mobile drag support
          minWidth: isDragging ? 180 : undefined,
          width: isDragging ?  "100%" : undefined,
          maxWidth: isDragging ? 400 : undefined,
        }}
        className={
          "p-2 bg-white shadow border hover:bg-accent transition select-none relative flex-1" +
          (isDragging ? " ring-2 ring-primary" : "")
        }
      >
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
      {onDelete && !isDragging && (
        <>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Delete menu"
            title="Delete menu"
            className="text-destructive hover:bg-destructive/10 mt-1"
            onClick={e => {
              e.stopPropagation();
              setShowConfirm(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
          </Button>
          <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <p>Are you sure you want to delete <b>{menu.name}</b>?</p>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowConfirm(false);
                    onDelete();
                  }}
                >
                  Confirm
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
});

DraggableMenuCard.displayName = "DraggableMenuCard";
export default DraggableMenuCard;
