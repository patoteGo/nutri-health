"use client";
import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";

// Helper function to get the appropriate unit abbreviation
import type { Ingredient as IngredientType } from "@/lib/types";

// Helper function to get the appropriate unit abbreviation
function getUnitAbbreviation(ingredient: Partial<IngredientType>): string {
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
import { Card } from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose
} from "../ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from "../ui/sheet";
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
  onEdit?: (menuData: {
    id: string;
    name: string;
    category?: string;
    ingredients?: { name: string; weight?: number }[];
  }) => void;
}

const DraggableMenuCard: React.FC<DraggableMenuCardProps> = React.memo(({ menu, day, mealMoment, onDelete, onEdit }) => {
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
  const [showEditSheet, setShowEditSheet] = useState(false);

  return (
    <div className="flex items-start">
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
           "p-2 bg-card text-card-foreground shadow border hover:bg-accent transition select-none relative flex-1" +
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
                {ingredient.weight ? ` (${ingredient.weight}${getUnitAbbreviation(ingredient)})` : ""}
              </li>
            ))}
          </ul>
        )}
      </Card>
      {!isDragging && (
        <div className="flex flex-row gap-1 ml-1">
          {/* Edit Button */}
          <Button
            size="icon"
            variant="ghost"
            aria-label="Edit menu"
            title="Edit menu"
            className="text-primary hover:bg-primary/10 h-8 w-8 p-0"
            onClick={e => {
              e.stopPropagation();
              setShowEditSheet(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
          </Button>
          
          {/* Delete Button */}
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              aria-label="Delete menu"
              title="Delete menu"
              className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
              onClick={e => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
            </Button>
          )}
          
          {/* Delete Confirmation Dialog */}
          {onDelete && (
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
          )}
          
          {/* Edit Sheet */}
          <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Edit Menu Item</SheetTitle>
              </SheetHeader>
              <div className="py-4 space-y-4">
                <div className="grid gap-4 py-4">
                  <div>
                    <h3 className="font-medium">Menu Details</h3>
                    <p className="text-sm text-muted-foreground mb-2">Edit the details of {menu.name}</p>
                    
                    {/* Add your form fields here for editing */}
                    <div className="space-y-2">
                      <p className="text-sm"><b>ID:</b> {menu.id}</p>
                      <p className="text-sm"><b>Name:</b> {menu.name}</p>
                      {menu.category && (
                        <p className="text-sm"><b>Category:</b> {menu.category}</p>
                      )}
                      {menu.ingredients && menu.ingredients.length > 0 && (
                        <div>
                          <p className="text-sm font-medium">Ingredients:</p>
                          <ul className="text-sm pl-5 list-disc">
                            {menu.ingredients.map((ingredient, idx) => (
                              <li key={idx}>
                                {ingredient.name}
                                {ingredient.weight ? ` (${ingredient.weight}${getUnitAbbreviation(ingredient)})` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button 
                  onClick={() => {
                    if (onEdit) {
                      onEdit(menu);
                    }
                    setShowEditSheet(false);
                  }}
                >
                  Save Changes
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
});

DraggableMenuCard.displayName = "DraggableMenuCard";
export default DraggableMenuCard;
