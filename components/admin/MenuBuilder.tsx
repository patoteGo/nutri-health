"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip";

import { DndContext, PointerSensor, useSensor, useSensors, useDroppable } from "@dnd-kit/core";
import DraggableMenuCard from "./DraggableMenuCard";
import type { Menu, Ingredient } from "@/lib/types";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from "zod";

import { toast } from "sonner";

const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  carbs: z.number(),
  protein: z.number(),
  fat: z.number(),
  imageUrl: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
});





const categories = ["Breakfast", "Lunch", "Dinner", "Snack"];


// MenuBuilder now requires personId as a prop
import { useTranslation } from "react-i18next";

function MenuBuilder({
  menus,
  onMenusChange,
  personId,
}: {
  menus: Menu[];
  onMenusChange: (menus: Menu[]) => void;
  personId: string;
}) {
  // dnd-kit sensors: PointerSensor supports both mouse and touch for mobile compatibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drag on mobile
      },
    })
  );
  // ...existing hooks
  const unassignedMenus = menus.filter(menu => !menu.assignedDay && !menu.assignedMoment);
  const { setNodeRef: unassignedSetNodeRef, isOver: unassignedIsOver } = useDroppable({ id: 'unassigned' });
  const { t } = useTranslation();
  const [menuName, setMenuName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [ingredientQuery, setIngredientQuery] = useState("");
  const [ingredientOptions, setIngredientOptions] = useState<z.infer<typeof IngredientSchema>[]>([]);
  const [ingredientLoading, setIngredientLoading] = useState(false);
  const [ingredientError, setIngredientError] = useState<string | null>(null);
  const [selectedIngredient, setSelectedIngredient] = useState<z.infer<typeof IngredientSchema> | null>(null);
  const [ingredientWeight, setIngredientWeight] = useState<number>(0);

  // Fetch ingredients as user types
  useEffect(() => {
    if (!ingredientQuery) {
      setIngredientOptions([]);
      return;
    }
    setIngredientLoading(true);
    setIngredientError(null);
    fetch(`/api/ingredients?search=${encodeURIComponent(ingredientQuery)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch ingredients");
        const data = await res.json();
        const parsed = z.array(IngredientSchema).safeParse(data);
        if (!parsed.success) throw new Error("Invalid ingredient data");
        setIngredientOptions(parsed.data);
      })
      .catch((e) => setIngredientError(e.message))
      .finally(() => setIngredientLoading(false));
  }, [ingredientQuery]);

  const isDuplicate = Boolean(selectedIngredient && ingredients.some(ing => ing.id === selectedIngredient.id));

  function addIngredient() {
    if (!selectedIngredient || ingredientWeight <= 0) return;
    if (isDuplicate) return;
    setIngredients(prev => [
      ...prev,
      { ...selectedIngredient, weight: ingredientWeight },
    ]);
    setSelectedIngredient(null);
    setIngredientQuery("");
    setIngredientWeight(0);
  }

  const queryClient = useQueryClient();

  // Mutation for deleting a menu from the DB
  const deleteMenuMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/menus?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error || 'Failed to delete menu');
      }
      return id;
    },
    onSuccess: (id: string) => {
      onMenusChange(menus.filter(menu => menu.id !== id));
      toast.success(t('menu_deleted_success', 'Menu deleted successfully!'));
      queryClient.invalidateQueries({ queryKey: ['menus'] });
    },
    onError: (error: unknown) => {
      // Type guard for error
      const message = typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : String(error);
      toast.error(message || t('menu_delete_failed', 'Failed to delete menu'));
    },
  });

  const menuMutation = useMutation({
    mutationFn: async ({ name, category, personId, ingredients }: { name: string; category: string; personId: string; ingredients: Ingredient[] }) => {
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, personId, ingredients }),
      });
      if (!res.ok) throw new Error('Failed to save menu');
      return res.json();
    },
    onSuccess: (menu: Menu) => {
      // Use the real menu object returned from the backend (with DB id)
      onMenusChange([...menus, menu]);
      setMenuName("");
      setCategory(categories[0]);
      setIngredients([]);
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success(t('menu_saved_success', 'Menu saved successfully!'));
    },
    onError: (error: unknown) => {
      // Type guard for error
      const message = typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : String(error);
      toast.error(message || t('menu_save_failed', 'Failed to save menu'));
    },
  });

  function addMenu() {
    // Check for missing fields and show toast for each case
    if (!menuName) {
      toast.error(t('enter_menu_name', 'Please enter a menu name.'));
      return;
    }
    if (!category) {
      toast.error(t('select_category', 'Please select a category.'));
      return;
    }
    if (ingredients.length === 0) {
      toast.error(t('add_at_least_one_ingredient', 'Please add at least one ingredient.'));
      return;
    }
    if (!personId) {
      toast.error(t('select_person_first', 'Please select a person before adding a menu.'));
      return;
    }
    menuMutation.mutate({ name: menuName, category, personId, ingredients });
  }


  return (
    <DndContext sensors={sensors} /* Add your onDragEnd, collisionDetection, etc. as needed */>
      <div className="border rounded p-4 mb-6 bg-muted/20">
      <h2 className="text-xl font-semibold mb-2">{t('menu_builder_title', 'Menu Builder')}</h2>
      <div className="flex flex-col gap-2 mb-4">
        <Input
          placeholder={t('menu_name', 'Menu name')}
          value={menuName}
          onChange={e => setMenuName(e.target.value)}
          className="w-full"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{t(cat.toLowerCase(), cat)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 items-start">
          <div className="flex-1 relative">
            <Input
              placeholder={t('search_ingredient', 'Search ingredient...')}
              value={selectedIngredient ? selectedIngredient.name : ingredientQuery}
              onChange={e => {
                setIngredientQuery(e.target.value);
                setSelectedIngredient(null);
              }}
              className="w-full"
              autoComplete="off"
            />
            {ingredientLoading && (
              <div className="absolute left-0 top-full bg-white border w-full z-10 p-2 text-xs">{t('loading', 'Loading...')}</div>
            )}
            {ingredientError && (
              <div className="absolute left-0 top-full bg-destructive text-destructive-foreground border w-full z-10 p-2 text-xs">{ingredientError}</div>
            )}
            {ingredientOptions.length > 0 && !selectedIngredient && (
              <ul className="absolute left-0 top-full bg-white border w-full z-10 max-h-48 overflow-auto">
                {ingredientOptions.map(opt => (
                  <li
                    key={opt.id}
                    className="p-2 hover:bg-accent cursor-pointer text-sm flex flex-col"
                    onClick={() => {
                      setSelectedIngredient(opt);
                      setIngredientQuery(opt.name);
                    }}
                  >
                    <span className="font-medium">{t(`ingredient_${opt.name.toLowerCase().replace(/\s+/g, '_')}`, opt.name)}</span>
                    <span className="text-xs text-muted-foreground">
                      {opt.carbs}g carbs, {opt.protein}g protein, {opt.fat}g fat / 100g
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Input
            type="number"
            placeholder={
              selectedIngredient?.unit === 'GRAM' ? t('weight_in_grams', 'Weight in grams')
              : selectedIngredient?.unit === 'ML' ? t('volume_in_milliliters', 'Volume in milliliters')
              : selectedIngredient?.unit ? t('quantity_with_unit', `Quantity (${selectedIngredient.unit.toLowerCase()})`)
              : t('amount', 'Amount')
            }
            value={ingredientWeight || ""}
            onChange={e => setIngredientWeight(
              selectedIngredient && [
                'UNIT', 'SLICE', 'TEASPOON', 'TABLESPOON', 'PIECE', 'CUP'
              ].includes(selectedIngredient.unit || '')
                ? Math.max(1, Math.floor(Number(e.target.value)))
                : Number(e.target.value)
            )}
            className="w-28"
            min={1}
            step={
              selectedIngredient && [
                'UNIT', 'SLICE', 'TEASPOON', 'TABLESPOON', 'PIECE', 'CUP'
              ].includes(selectedIngredient.unit || '') ? 1 : 0.1
            }
            inputMode={
              selectedIngredient && [
                'UNIT', 'SLICE', 'TEASPOON', 'TABLESPOON', 'PIECE', 'CUP'
              ].includes(selectedIngredient.unit || '') ? 'numeric' : 'decimal'
            }
            aria-label={
              selectedIngredient?.unit === 'GRAM' ? t('weight_in_grams', 'Weight in grams')
              : selectedIngredient?.unit === 'ML' ? t('volume_in_milliliters', 'Volume in milliliters')
              : selectedIngredient?.unit ? t('quantity_with_unit', `Quantity (${selectedIngredient.unit.toLowerCase()})`)
              : t('amount', 'Amount')
            }
          />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                onClick={addIngredient}
                variant="outline"
                disabled={!selectedIngredient || ingredientWeight <= 0 || isDuplicate}
                title={isDuplicate ? t('ingredient_already_in_list', 'This ingredient is already in the list') : ''}
                aria-label="Add Ingredient"
              >
                +
              </Button>
            </TooltipTrigger>
            <TooltipContent>Add Ingredient / Adicionar ingrediente</TooltipContent>
          </Tooltip>
        </div>
        {isDuplicate && (
          <div className="text-destructive text-sm mt-1 flex items-center gap-1" role="alert">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01m-6.938 2h13.856c1.54 0 2.502-1.667 1.732-3L13.732 5c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            {t('ingredient_already_in_list', 'This ingredient is already on the list.')}
          </div>
        )}
        <ul className="list-disc ml-6 mt-2 text-sm">
          {ingredients.map((ing, idx) => (
            <li key={idx} className="flex items-center gap-3 py-2">
              <button
                type="button"
                aria-label="Delete ingredient"
                title="Delete ingredient"
                className="mr-2 p-1 rounded hover:bg-destructive/10 transition-colors"
                onClick={() => {
                  setIngredients(ingredients => ingredients.filter((_, i) => i !== idx));
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-destructive"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ing.imageUrl || '/placeholder-ingredient.png'}
                alt={ing.name}
                className="w-10 h-10 object-cover rounded-md border"
                style={{ minWidth: 40, minHeight: 40 }}
                onError={e => (e.currentTarget.src = '/placeholder-ingredient.png')}
              />
              <div className="flex-1 flex flex-col">
                <span>{t(`ingredient_${ing.name.toLowerCase().replace(/\s+/g, '_')}`, ing.name)} — {ing.weight}{
                  ing.unit === 'GRAM' ? 'g'
                  : ing.unit === 'ML' ? 'ml'
                  : ing.unit ? ` (${ing.unit.toLowerCase()})`
                  : ''
                }</span>
                <span className="text-xs text-muted-foreground">
                  {t('ingredient_nutrition_info', {
                    carbs: ing.carbs,
                    protein: ing.protein,
                    fat: ing.fat,
                    unit: ing.unit === 'GRAM' ? '100g' : ing.unit === 'ML' ? '100ml' : 'unit'
                  })}
                </span>
              </div>
            </li>
          ))}
        </ul>
        <Button type="button" onClick={addMenu} className="mt-2" disabled={!menuName || ingredients.length === 0}>
          {t('add_menu', 'Add Menu')}
        </Button>
      </div>
      <div>
        <h3 className="font-medium mb-1">{t('menus', 'Menus')}</h3>
        {/* Droppable area for unassigned menus */}
        {/* Droppable area for unassigned menus */}
        {/* Move useDroppable to top-level in component for React Hook rules compliance */}
         <ul
           ref={unassignedSetNodeRef}
           className={
             "space-y-2 min-h-[48px] p-1 rounded border border-dashed " +
             (unassignedIsOver ? "bg-accent/20 border-primary" : "border-muted-foreground/20 bg-white")
           }
           style={{ transition: 'background 0.2s, border-color 0.2s' }}
         >
           {unassignedMenus.length === 0 && (
             <div className="text-muted-foreground text-sm">{t('no_menus_yet', 'No menus yet.')}</div>
           )}
            {unassignedMenus.map(menu => (
              <li key={menu.id} className="mb-4">
                {/* Pass the deleteMenuMutation directly to the DraggableMenuCard component */}
                <DraggableMenuCard
                  menu={menu}
                  day="unassigned"
                  mealMoment="unassigned"
                  onDelete={() => deleteMenuMutation.mutate(menu.id)}
                />
              </li>
            ))}
         </ul>
       </div>
     </div>
    </DndContext>
  );
}

MenuBuilder.displayName = "MenuBuilder";
export default MenuBuilder;
