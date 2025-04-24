"use client";

import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "../../lib/utils";

// Define the ingredient schema directly in this component to avoid import issues
const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  carbs: z.number(),
  protein: z.number(),
  fat: z.number(),
  imageUrl: z.string().optional().nullable(),
  unit: z.enum(['GRAM', 'ML']).optional().nullable(),
  weight: z.number().optional(),
});

export type Ingredient = z.infer<typeof IngredientSchema>;

interface IngredientSearchProps {
  onIngredientSelect: (ingredient: Ingredient | null) => void;
  selectedIngredient: Ingredient | null;
  className?: string;
  placeholder?: string;
}

export function IngredientSearch({
  onIngredientSelect,
  selectedIngredient,
  className,
  placeholder = "Search ingredients"
}: IngredientSearchProps) {
  const [query, setQuery] = useState<string>(selectedIngredient?.name || "");
  const [options, setOptions] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Show error as toast if not null
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Fetch ingredients as user types
  useEffect(() => {
    // Don't search if there's already a selected ingredient or no query
    if (!query || selectedIngredient) {
      setOptions([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    fetch(`/api/ingredients?search=${encodeURIComponent(query)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch ingredients");
        const data = await res.json();
        const parsed = z.array(IngredientSchema).safeParse(data);
        if (!parsed.success) throw new Error("Invalid ingredient data");
        // Ensure the data has the right types
        const typedData = parsed.data.map(item => ({
          ...item,
          unit: item.unit as 'GRAM' | 'ML' | undefined,
          weight: item.weight || 0
        }));
        setOptions(typedData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [query, selectedIngredient]);

  return (
    <div className={cn("relative", className)}>
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (selectedIngredient && e.target.value !== selectedIngredient.name) {
            onIngredientSelect(null);
          }
        }}
        placeholder={placeholder}
      />
      
      {options.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-popover text-popover-foreground shadow-lg rounded-md border border-border max-h-60 overflow-auto">
          {options.map((ing) => (
            <button
              key={ing.id}
              type="button"
              className={cn(
                "w-full text-left px-3 py-2 flex justify-between items-center rounded-sm transition-colors",
                "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => {
                onIngredientSelect(ing);
                setQuery(ing.name);
                setOptions([]);
              }}
            >
              <span>{ing.name}</span>
              <span className="text-xs text-muted-foreground">
                {ing.carbs}C {ing.protein}P {ing.fat}F
              </span>
            </button>
          ))}
        </div>
      )}
      
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="animate-spin h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </div>
  );
}

export default IngredientSearch;
