"use client";

import React, { useState, useEffect } from "react";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { z } from "zod";
import { cn } from "../../lib/utils";

// Define the ingredient schema directly in this component to match the Prisma model
// Using .passthrough() to allow additional properties from the API
const IngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  carbs: z.number(),
  protein: z.number(),
  fat: z.number(),
  imageUrl: z.string().optional().nullable(),
  // Make unit optional and allow any string value to be flexible with the database
  unit: z.string().optional().nullable(),
  // Make searchTerms optional
  searchTerms: z.array(z.string()).optional(),
  weight: z.number().optional(),
}).passthrough();

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
    // Don't search if there's no query
    if (!query) {
      setOptions([]);
      return;
    }
    
    // If the query exactly matches the selected ingredient name, don't show dropdown
    if (selectedIngredient && query === selectedIngredient.name) {
      setOptions([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Add a small delay to prevent too many API calls while typing
    const timeoutId = setTimeout(() => {
      setLoading(true);
      setError(null);
      
      fetch(`/api/ingredients?search=${encodeURIComponent(query)}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch ingredients");
          const data = await res.json();
          
          // Log the data for debugging
          console.log('API response:', data);
          
          if (!Array.isArray(data)) {
            console.error('Expected array but got:', typeof data);
            throw new Error('Invalid response format: expected an array');
          }
          
          if (data.length === 0) {
            // Handle empty results gracefully
            setOptions([]);
            return;
          }
          
          try {
            // Try to parse the data with our schema
            const parsed = z.array(IngredientSchema).safeParse(data);
            
            if (!parsed.success) {
              console.error('Validation error:', parsed.error);
              
              // Fallback: try to extract the required fields manually
              const manuallyParsed = data.map((item: any) => ({
                id: String(item.id || ''),
                name: String(item.name || ''),
                carbs: Number(item.carbs || 0),
                protein: Number(item.protein || 0),
                fat: Number(item.fat || 0),
                imageUrl: item.imageUrl || null,
                unit: item.unit || 'GRAM',
                searchTerms: Array.isArray(item.searchTerms) ? item.searchTerms : [],
                weight: Number(item.weight || 0)
              }));
              
              setOptions(manuallyParsed);
              return;
            }
            
            // Use the properly validated data
            const typedData = parsed.data.map(item => ({
              ...item,
              searchTerms: item.searchTerms || [],
              weight: item.weight || 0
            }));
            
            setOptions(typedData);
          } catch (error) {
            console.error('Error processing ingredient data:', error);
            throw error;
          }
        })
        .catch((e) => {
          console.error('Fetch error:', e);
          setError(e.message);
        })
        .finally(() => setLoading(false));
    }, 300); // 300ms delay for debouncing
    
    // Cleanup the timeout if the component unmounts or query changes again
    return () => clearTimeout(timeoutId);
  }, [query, selectedIngredient]);

  return (
    <div className={cn("relative", className)}>
      <Input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          // Clear selected ingredient when the search query changes
          if (selectedIngredient && e.target.value !== selectedIngredient.name) {
            onIngredientSelect(null);
          }
        }}
        onBlur={() => {
          // Close dropdown when input loses focus (with small delay to allow click on options)
          setTimeout(() => setOptions([]), 200);
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
                setOptions([]); // Clear options to close dropdown
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
