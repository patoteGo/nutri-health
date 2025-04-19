"use client";
import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "../../components/ui/select";

import { z } from "zod";

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

export default function MenuBuilder({
  menus,
  onMenusChange,
}: {
  menus: Menu[];
  onMenusChange: (menus: Menu[]) => void;
}) {
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

  function addIngredient() {
    if (!selectedIngredient || ingredientWeight <= 0) return;
    setIngredients(prev => [
      ...prev,
      { ...selectedIngredient, weight: ingredientWeight },
    ]);
    setSelectedIngredient(null);
    setIngredientQuery("");
    setIngredientWeight(0);
  }

  function addMenu() {
    if (!menuName || !category || ingredients.length === 0) return;
    const newMenu: Menu = {
      id: Math.random().toString(36).slice(2),
      name: menuName,
      category,
      ingredients,
    };
    onMenusChange([...menus, newMenu]);
    setMenuName("");
    setCategory(categories[0]);
    setIngredients([]);
  }

  function removeMenu(id: string) {
    onMenusChange(menus.filter(menu => menu.id !== id));
  }

  return (
    <div className="border rounded p-4 mb-6 bg-muted/20">
      <h2 className="text-xl font-semibold mb-2">Menu Builder</h2>
      <div className="flex flex-col gap-2 mb-4">
        <Input
          placeholder="Menu name"
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
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex gap-2 items-start">
          <div className="flex-1 relative">
            <Input
              placeholder="Search ingredient..."
              value={selectedIngredient ? selectedIngredient.name : ingredientQuery}
              onChange={e => {
                setIngredientQuery(e.target.value);
                setSelectedIngredient(null);
              }}
              className="w-full"
              autoComplete="off"
            />
            {ingredientLoading && (
              <div className="absolute left-0 top-full bg-white border w-full z-10 p-2 text-xs">Loading...</div>
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
                    <span className="font-medium">{opt.name}</span>
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
              selectedIngredient?.unit === 'GRAM' ? 'Weight (g)'
              : selectedIngredient?.unit === 'ML' ? 'Volume (ml)'
              : selectedIngredient?.unit ? 'Quantity'
              : 'Amount'
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
              selectedIngredient?.unit === 'GRAM' ? 'Weight in grams'
              : selectedIngredient?.unit === 'ML' ? 'Volume in milliliters'
              : selectedIngredient?.unit ? `Quantity (${selectedIngredient.unit.toLowerCase()})`
              : 'Amount'
            }
          />
          <Button type="button" onClick={addIngredient} variant="secondary" disabled={!selectedIngredient || ingredientWeight <= 0}>
            Add Ingredient
          </Button>
        </div>
        <ul className="list-disc ml-6 mt-2 text-sm">
          {ingredients.map((ing, idx) => (
            <li key={idx} className="flex items-center gap-3 py-2">
              <div className="flex-1 flex flex-col">
                <span>{ing.name} — {ing.weight}{
                  ing.unit === 'GRAM' ? 'g'
                  : ing.unit === 'ML' ? 'ml'
                  : ing.unit ? ` (${ing.unit.toLowerCase()})`
                  : ''
                }</span>
                <span className="text-xs text-muted-foreground">
                  {ing.carbs}g carbs, {ing.protein}g protein, {ing.fat}g fat / {ing.unit === 'GRAM' ? '100g' : ing.unit === 'ML' ? '100ml' : 'unit'}
                </span>
              </div>
              <img
                src={ing.imageUrl || '/placeholder-ingredient.png'}
                alt={ing.name}
                className="w-10 h-10 object-cover rounded-md border"
                style={{ minWidth: 40, minHeight: 40 }}
                onError={e => (e.currentTarget.src = '/placeholder-ingredient.png')}
              />
            </li>
          ))}
        </ul>
        <Button type="button" onClick={addMenu} className="mt-2" disabled={!menuName || ingredients.length === 0}>
          Add Menu
        </Button>
      </div>
      <div>
        <h3 className="font-medium mb-1">Menus</h3>
        {menus.length === 0 && <div className="text-muted-foreground text-sm">No menus yet.</div>}
        <ul className="space-y-2">
          {menus.map(menu => (
            <li key={menu.id} className="border rounded p-2 bg-white flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <span className="font-semibold">{menu.name}</span>
                <Button size="sm" variant="destructive" onClick={() => removeMenu(menu.id)}>
                  Remove
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">{menu.category}</div>
              <ul className="text-xs ml-4">
                {menu.ingredients.map((ing, idx) => (
                  <li key={idx}>{ing.name} — {ing.weight}g</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
