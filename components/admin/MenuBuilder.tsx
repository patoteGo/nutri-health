"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "../../components/ui/dialog";
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
type Ingredient = z.infer<typeof IngredientSchema> & { weight: number }; // includes imageUrl


interface Menu {
  id: string;
  name: string;
  category: string;
  ingredients: Ingredient[];
}

const categories = ["Breakfast", "Lunch", "Dinner", "Snack"];


// MenuBuilder now requires personId as a prop
import { useTranslation } from "react-i18next";

export default function MenuBuilder({
  menus,
  onMenusChange,
  personId,
}: {
  menus: Menu[];
  onMenusChange: (menus: Menu[]) => void;
  personId: string;
}) {
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

  const isDuplicate = selectedIngredient && ingredients.some(ing => ing.id === selectedIngredient.id);

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
    onSuccess: (data) => {
      onMenusChange([...menus, { id: Math.random().toString(36).slice(2), name: menuName, category, ingredients }]);
      setMenuName("");
      setCategory(categories[0]);
      setIngredients([]);
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success(t('menu_saved_success', 'Menu saved successfully!'));
    },
    onError: (error: any) => {
      toast.error(error?.message || t('menu_save_failed', 'Failed to save menu'));
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

  function removeMenu(id: string) {
    onMenusChange(menus.filter(menu => menu.id !== id));
  }

  return (
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
        {menus.length === 0 && <div className="text-muted-foreground text-sm">{t('no_menus_yet', 'No menus yet.')}</div>}
        <ul className="space-y-2">
          {menus.map(menu => (
            <li key={menu.id} className="border rounded p-2 bg-white flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{menu.name}</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label="Delete menu" title="Delete menu">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-destructive"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Menu</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this menu? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button variant="destructive" onClick={e => {
                        removeMenu(menu.id);
                        // Close dialog via ref
                        const dialog = e.currentTarget.closest('[data-slot="dialog-content"]');
                        if (dialog) {
                          (dialog.querySelector('[data-slot="dialog-close"]') as HTMLElement)?.click();
                        }
                      }}>Delete</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="text-xs text-muted-foreground">{menu.category}</div>
              <ul className="text-xs ml-4">
                {menu.ingredients.map((ing, idx) => (
                  <li key={idx}>{t(`ingredient_${ing.name.toLowerCase().replace(/\s+/g, '_')}`, ing.name)} — {ing.weight}g</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

