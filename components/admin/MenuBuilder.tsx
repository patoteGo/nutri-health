"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from "../ui/sheet";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
// import { cn } from "../../lib/utils";
import IngredientSearch, { Ingredient } from "./IngredientSearch";
import type { MealMoment } from "./__mealMomentTypes";
import type { Menu } from "@/lib/types";

// Local schema for validation
const LocalIngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  carbs: z.number(),
  protein: z.number(),
  fat: z.number(),
  imageUrl: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
});

interface MenuBuilderProps {
  menus: Menu[];
  onMenusChange: (menus: Menu[]) => void;
  personId: string;
  parentIsDragging?: boolean;
}

// No need for extended type as we're handling the conversion in the component

function MenuBuilder({ menus, onMenusChange, personId}: MenuBuilderProps) {
  // Convert incoming menus to ensure ingredients have the right properties
  const convertedMenus = React.useMemo(() => {
    return menus.map(menu => ({
      ...menu,
      ingredients: menu.ingredients?.map(ing => ({
        ...ing,
        weight: typeof ing.weight === 'number' ? ing.weight : 0,
        unit: (ing.unit === 'GRAM' || ing.unit === 'ML') ? ing.unit : 'GRAM'
      }))
    }));
  }, [menus]);
  const { t } = useTranslation();
  const unassignedMenus = convertedMenus.filter(menu => !menu.assignedDay && !menu.assignedMoment);
  
  const [menuName, setMenuName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  const [showEditIngredientSheet, setShowEditIngredientSheet] = useState(false);

  const [mealMoments, setMealMoments] = useState<MealMoment[]>([]);
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    fetch(`${baseUrl}/api/meal-moments`)
      .then(res => res.json())
      .then((data: MealMoment[]) => {
        setMealMoments(data);
        if (data.length > 0) setCategory(data[0].name);
      })
      .catch(err => {
        console.error('Failed to fetch meal moments:', err);
      });
  }, []);

  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [ingredientWeight, setIngredientWeight] = useState<number>(0);

  const isDuplicate = Boolean(selectedIngredient && ingredients.some(ing => ing.id === selectedIngredient.id));

  function addIngredient() {
    if (!selectedIngredient || ingredientWeight <= 0) return;
    if (isDuplicate) return;
    setIngredients(prev => [
      ...prev,
      { ...selectedIngredient, weight: ingredientWeight },
    ]);
    setSelectedIngredient(null);
    setIngredientWeight(0);
  }

  const queryClient = useQueryClient();

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
      const updatedMenus = [...menus];
      updatedMenus.push(menu);
      onMenusChange(updatedMenus);
      setMenuName("");
      setCategory(mealMoments.length > 0 ? mealMoments[0].name : "");
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
    // Map UI category to backend MealMoment enum

    menuMutation.mutate({
      name: menuName,
      category,
      personId,
      ingredients
    });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* First column - Menu building form */}
      <div className="rounded-lg border border-border p-4 bg-card text-card-foreground shadow-sm">
        <h3 className="font-medium mb-2">{t('new_menu', 'New Menu')}</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="menu-name" className="block text-sm font-medium mb-1">
              {t('name', 'Name')}
            </label>
            <Input
              id="menu-name"
              value={menuName}
              onChange={e => setMenuName(e.target.value)}
              placeholder={t('menu_name_placeholder', 'Enter menu name')}
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-1">
              {t('category', 'Category')}
            </label>
            <Select value={category} onValueChange={setCategory}>

              <SelectTrigger id="category">
                <SelectValue placeholder={t('select_category', 'Select category')} />
              </SelectTrigger>
              <SelectContent>
                {mealMoments.map(moment => (
                  <SelectItem key={moment.name} value={moment.name}>
                    {moment.description || moment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="ingredients" className="block text-sm font-medium mb-1">
              {t('ingredients', 'Ingredients')}
            </label>
            <div className="flex items-start gap-2 mb-1">
              <div className="flex-1">
                <IngredientSearch
                  onIngredientSelect={setSelectedIngredient}
                  selectedIngredient={selectedIngredient}
                  placeholder={t('search_ingredients', 'Search ingredients')}
                />
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  value={ingredientWeight || ''}
                  onChange={e => setIngredientWeight(parseInt(e.target.value) || 0)}
                  placeholder="g"
                  disabled={!selectedIngredient}
                />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    onClick={addIngredient}
                    disabled={!selectedIngredient || ingredientWeight <= 0 || isDuplicate}
                    size="icon"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t('add_ingredient', 'Add ingredient')}
                </TooltipContent>
              </Tooltip>
            </div>
            {isDuplicate && (
              <div className="text-destructive text-sm mt-1 flex items-center gap-1" role="alert">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01m-6.938 2h13.856c1.54 0 2.502-1.667 1.732-3L13.732 5c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                {t('ingredient_already_in_list', 'This ingredient is already on the list.')}
              </div>
            )}
          </div>
        </div>
        <ul className="list-disc ml-6 mt-2 text-sm">
          {ingredients.map((ing, idx) => (
            <li key={idx} className="flex items-center gap-3 py-2">
              <div className="flex gap-1">
                {/* Edit button */}
                <button
                  type="button"
                  aria-label="Edit ingredient"
                  title="Edit ingredient"
                  className="text-primary hover:bg-primary/10 rounded-full p-1"
                  onClick={() => {
                    // Open a sheet or dialog to edit the ingredient
                    setEditingIngredientIndex(idx);
                    setShowEditIngredientSheet(true);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </button>
                {/* Delete button */}
                <button
                  type="button"
                  aria-label="Delete ingredient"
                  title="Delete ingredient"
                  className="text-destructive hover:bg-destructive/10 rounded-full p-1"
                  onClick={() => {
                    setIngredients(prev => prev.filter((_, i) => i !== idx));
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="flex-1 flex flex-col">
                <span>{t(`ingredient_${ing.name ? ing.name.toLowerCase().replace(/\s+/g, '_') : ''}`, ing.name)} — {ing.weight}{
                  ing.unit === 'GRAM' ? 'g'
                  : ing.unit === 'ML' ? 'ml'
                  : ing.unit ? ` (${ing.unit})` 
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
        <Button type="button" onClick={addMenu} className="mt-4" disabled={!menuName || ingredients.length === 0}>
          {t('add_menu', 'Add Menu')}
        </Button>
      </div>

      {/* Second column - Unassigned menus */}
      <div className="h-auto">
        <h3 className="font-medium mb-2">{t('unassigned_menus', 'Unassigned Menus')} ({unassignedMenus.length})</h3>
        <Droppable droppableId="unassigned" type="menu">
          {(provided, snapshot) => (
            <div 
              {...provided.droppableProps}
              ref={provided.innerRef} 
              className={`border rounded-lg p-4 bg-muted/50 min-h-[120px] transition-all grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 ${snapshot.isDraggingOver ? 'ring-2 ring-primary' : ''}`}
            >
              {unassignedMenus.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">{t('no_unassigned_menus', 'No unassigned menus')}</p>
              ) : (
                unassignedMenus.map((menu, index) => (
                  <Draggable key={menu.id} draggableId={menu.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`p-2 bg-white shadow border hover:bg-accent dark:bg-accent dark:hover:bg-accent/10 transition select-none relative ${snapshot.isDragging ? "ring-2 ring-primary" : ""}`}
                        style={{
                          ...provided.draggableProps.style,
                          zIndex: snapshot.isDragging ? 100 : 'auto',
                          // Set fixed width when dragging to match day columns
                          ...(snapshot.isDragging ? {
                            width: '180px', 
                            maxWidth: '180px'
                          } : {})
                        }}
                      >
                        <div className="flex justify-between items-center gap-2 mb-1">
                          <span className="font-medium">{menu.name}</span>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 text-destructive hover:bg-destructive/10"
                            onClick={() => deleteMenuMutation.mutate(menu.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                          </Button>
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
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
      
      {/* Edit Ingredient Sheet */}
      <Sheet open={showEditIngredientSheet} onOpenChange={setShowEditIngredientSheet}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('edit_ingredient', 'Edit Ingredient')}</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            {editingIngredientIndex !== null && ingredients[editingIngredientIndex] && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-ingredient-name" className="text-right">
                    {t('name', 'Name')}:
                  </label>
                  <div className="col-span-3">
                    <IngredientSearch
                      onIngredientSelect={(ingredient) => {
                        if (ingredient) {
                          const newIngredients = [...ingredients];
                          newIngredients[editingIngredientIndex] = {
                            ...ingredient,
                            weight: newIngredients[editingIngredientIndex].weight,
                            unit: newIngredients[editingIngredientIndex].unit
                          };
                          setIngredients(newIngredients);
                        }
                      }}
                      selectedIngredient={ingredients[editingIngredientIndex]}
                      placeholder={t('search_ingredients', 'Search ingredients')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-ingredient-weight" className="text-right">
                    {t('weight', 'Weight')}:
                  </label>
                  <Input
                    id="edit-ingredient-weight"
                    type="number"
                    value={ingredients[editingIngredientIndex].weight}
                    className="col-span-3"
                    onChange={(e) => {
                      const newIngredients = [...ingredients];
                      newIngredients[editingIngredientIndex] = {
                        ...newIngredients[editingIngredientIndex],
                        weight: Number(e.target.value)
                      };
                      setIngredients(newIngredients);
                    }}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-ingredient-unit" className="text-right">
                    {t('unit', 'Unit')}:
                  </label>
                  <Select
                    value={ingredients[editingIngredientIndex].unit || 'GRAM'}
                    onValueChange={(value) => {
                      const newIngredients = [...ingredients];
                      newIngredients[editingIngredientIndex] = {
                        ...newIngredients[editingIngredientIndex],
                        unit: value as 'GRAM' | 'ML' | undefined
                      };
                      setIngredients(newIngredients);
                    }}
                  >
                    <SelectTrigger className="col-span-3" id="edit-ingredient-unit">
                      <SelectValue placeholder={t('select_unit', 'Select unit')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GRAM">g ({t('gram', 'Gram')})</SelectItem>
                      <SelectItem value="ML">ml ({t('milliliter', 'Milliliter')})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">{t('cancel', 'Cancel')}</Button>
            </SheetClose>
            <Button 
              onClick={() => {
                // Validate ingredients before closing
                z.array(LocalIngredientSchema).safeParse(ingredients);
                setShowEditIngredientSheet(false);
                setEditingIngredientIndex(null);
              }}
            >
              {t('save_changes', 'Save Changes')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default MenuBuilder;
