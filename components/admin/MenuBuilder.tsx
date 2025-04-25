"use client";
import React, { useState, useEffect, useRef } from "react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
// import { cn } from "../../lib/utils";
import IngredientSearch, { Ingredient as SearchIngredient } from "./IngredientSearch";
import type { MealMoment } from "./__mealMomentTypes";
import type { Menu, Ingredient as LibIngredient } from "@/lib/types";

// Extend the library Ingredient type with an index signature for type compatibility
export interface Ingredient extends LibIngredient {
  weight: number; // Ensure weight is required and a number
  [key: string]: unknown; // Index signature to allow additional properties
}

// Helper function to ensure ingredient has all required properties with correct types
function ensureValidIngredient(ingredient: SearchIngredient): Ingredient {
  return {
    ...ingredient,
    // Ensure all required properties are present with correct types
    id: ingredient.id || '',
    name: ingredient.name || '',
    carbs: typeof ingredient.carbs === 'number' ? ingredient.carbs : 0,
    protein: typeof ingredient.protein === 'number' ? ingredient.protein : 0,
    fat: typeof ingredient.fat === 'number' ? ingredient.fat : 0,
    weight: typeof ingredient.weight === 'number' ? ingredient.weight : 0,
    unit: ingredient.unit || 'GRAM'
  };
}

// Local schema for validation
const LocalIngredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  carbs: z.number(),
  protein: z.number(),
  fat: z.number(),
  imageUrl: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
  weight: z.number(),
}).passthrough(); // Use passthrough to allow additional properties

interface MenuBuilderProps {
  menus: Menu[];
  onMenusChange: (menus: Menu[]) => void;
  personId: string;
  parentIsDragging?: boolean;
  mealMoments?: MealMoment[];
  category?: string;
  onCategoryChange?: (category: string) => void;
}

// No need for extended type as we're handling the conversion in the component

function MenuBuilder({ menus, onMenusChange, personId }: MenuBuilderProps) {
  // Convert incoming menus to ensure ingredients have the right properties
  const convertedMenus = React.useMemo(() => {
    return menus.map(menu => ({
      ...menu,
      ingredients: menu.ingredients?.map(ing => ({
        ...ing,
        weight: typeof ing.weight === 'number' ? ing.weight : 0,
        unit: (ing.unit === 'GRAM' || ing.unit === 'ML') ? ing.unit : 'GRAM',
        // Add index signature compatibility
        id: ing.id || '',
        name: ing.name || '',
        carbs: typeof ing.carbs === 'number' ? ing.carbs : 0,
        protein: typeof ing.protein === 'number' ? ing.protein : 0,
        fat: typeof ing.fat === 'number' ? ing.fat : 0
      } as Ingredient))
    }));
  }, [menus]);
  const { t } = useTranslation();

  // Fetch all menus from the database
  const { data: dbMenus, isLoading: menusLoading, error: menusError } = useQuery<Menu[]>({
    queryKey: ["menus", personId],
    queryFn: async () => {
      const res = await fetch(`/api/menus?personId=${personId}`);
      if (!res.ok) throw new Error("Failed to fetch menus");
      return await res.json();
    },
    enabled: !!personId,
  });

  // Convert database menus to ensure ingredients have the right properties
  const convertedDbMenus = React.useMemo(() => {
    if (!dbMenus || !Array.isArray(dbMenus)) return [];
    return dbMenus.map((menu: Menu) => ({
      ...menu,
      ingredients: menu.ingredients?.map((ing: LibIngredient) => ({
        ...ing,
        weight: typeof ing.weight === 'number' ? ing.weight : 0,
        unit: (ing.unit === 'GRAM' || ing.unit === 'ML') ? ing.unit : 'GRAM',
        // Add index signature compatibility
        id: ing.id || '',
        name: ing.name || '',
        carbs: typeof ing.carbs === 'number' ? ing.carbs : 0,
        protein: typeof ing.protein === 'number' ? ing.protein : 0,
        fat: typeof ing.fat === 'number' ? ing.fat : 0
      } as Ingredient))
    }));
  }, [dbMenus]);

  // Combine menus from props and database, removing duplicates
  const allMenus = React.useMemo(() => {
    const propMenuIds = new Set(convertedMenus.map((menu: Menu) => menu.id));
    // Only include DB menus that aren't already in props
    const uniqueDbMenus = convertedDbMenus.filter((menu: Menu) => !propMenuIds.has(menu.id));
    return [...convertedMenus, ...uniqueDbMenus];
  }, [convertedMenus, convertedDbMenus]);

  // Filter unassigned menus
  const unassignedMenus = allMenus.filter(menu => !menu.assignedDay && !menu.assignedMoment);

  const [menuName, setMenuName] = useState("");
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [editingIngredientIndex, setEditingIngredientIndex] = useState<number | null>(null);
  const [showEditIngredientSheet, setShowEditIngredientSheet] = useState(false);

  // State for editing an existing menu
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [showEditMenuSheet, setShowEditMenuSheet] = useState(false);

  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<string | null>(null);

  // Ref to track the current ingredient being edited in the menu
  const currentEditingMenuIngredientIndex = useRef<number | null>(null);

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

  const [selectedIngredient, setSelectedIngredient] = useState<SearchIngredient | null>(null);
  const [ingredientWeight, setIngredientWeight] = useState<number>(0);

  const isDuplicate = Boolean(selectedIngredient && ingredients.some(ing => ing.id === selectedIngredient.id));

  // Effect to handle updating menu ingredient when edit sheet closes
  useEffect(() => {
    if (!showEditIngredientSheet && editingMenu && currentEditingMenuIngredientIndex.current !== null && ingredients.length > 0) {
      // Update the ingredient in the menu
      const updatedIngredients = [...(editingMenu.ingredients || [])];
      const idx = currentEditingMenuIngredientIndex.current;

      if (idx !== null && idx >= 0 && updatedIngredients[idx] && ingredients[0]) {
        // Ensure weight is a number
        const updatedIngredient: Ingredient = {
          ...ingredients[0],
          weight: typeof ingredients[0].weight === 'number' ? ingredients[0].weight : 0
        };

        updatedIngredients[idx] = updatedIngredient;
        setEditingMenu({
          ...editingMenu,
          ingredients: updatedIngredients
        });
      }

      // Reset the ref
      currentEditingMenuIngredientIndex.current = null;
    }
  }, [showEditIngredientSheet, editingMenu, ingredients]);

  // Function to get the appropriate placeholder based on the ingredient unit or name
  function getUnitPlaceholder(unit?: string | null, ingredientName?: string | null): string {
    // Special case for eggs - they should always be counted in units
    if (ingredientName && ingredientName.toLowerCase().includes('egg')) {
      return 'unit(s)';
    }

    // Special case for slices - they should always be counted in slices
    if (ingredientName && ingredientName.toLowerCase().includes('slice')) {
      return 'slice(s)';
    }

    if (!unit) return 'g';

    switch (unit) {
      case 'GRAM': return 'g';
      case 'ML': return 'ml';
      case 'SLICE': return 'slice(s)';
      case 'UNIT': return 'unit(s)';
      case 'TEASPOON': return 'tsp';
      case 'TABLESPOON': return 'tbsp';
      case 'CUP': return 'cup(s)';
      case 'PIECE': return 'piece(s)';
      default: return 'g';
    }
  }

  // Function to get the appropriate label based on the ingredient unit or name
  function getUnitLabel(unit?: string | null, ingredientName?: string | null): string {
    // Special case for eggs - they should always be counted in units
    if (ingredientName && ingredientName.toLowerCase().includes('egg')) {
      return t('units', 'Units');
    }

    // Special case for slices - they should always be counted in slices
    if (ingredientName && ingredientName.toLowerCase().includes('slice')) {
      return t('slices', 'Slices');
    }

    if (!unit) return t('quantity', 'Quantity');

    switch (unit) {
      case 'GRAM': return t('weight', 'Weight');
      case 'ML': return t('volume', 'Volume');
      case 'SLICE': return t('slices', 'Slices');
      case 'UNIT': return t('units', 'Units');
      case 'TEASPOON': return t('teaspoons', 'Teaspoons');
      case 'TABLESPOON': return t('tablespoons', 'Tablespoons');
      case 'CUP': return t('cups', 'Cups');
      case 'PIECE': return t('pieces', 'Pieces');
      default: return t('quantity', 'Quantity');
    }
  }

  function addIngredient() {
    if (!selectedIngredient || ingredientWeight <= 0) return;
    if (isDuplicate) return;

    // Convert the selected ingredient to our Ingredient type
    const newIngredient = ensureValidIngredient({
      ...selectedIngredient,
      weight: ingredientWeight
    });

    // Add the ingredient to the list
    setIngredients(prev => [
      ...prev,
      newIngredient,
    ]);

    // Clear the selected ingredient
    setSelectedIngredient(null);

    // Reset the ingredient weight
    setIngredientWeight(0);

    // Clear the search input by forcing a re-render of the IngredientSearch component
    // This is done by providing a key that changes when we want to reset the component
  }

  const queryClient = useQueryClient();

  // Function to handle delete confirmation
  const handleDeleteConfirm = (id: string) => {
    setMenuToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Function to execute delete when confirmed
  const confirmDeleteMenu = () => {
    if (menuToDelete) {
      deleteMenuMutation.mutate(menuToDelete);
      setIsDeleteDialogOpen(false);
      setMenuToDelete(null);
    }
  };

  // Function to cancel delete
  const cancelDeleteMenu = () => {
    setIsDeleteDialogOpen(false);
    setMenuToDelete(null);
  };

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

  // Mutation for updating an existing menu
  const updateMenuMutation = useMutation({
    mutationFn: async ({ id, name, category, personId, ingredients }: { id: string; name: string; category: string; personId: string; ingredients: Ingredient[] }) => {
      const res = await fetch(`/api/menus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, category, personId, ingredients }),
      });
      if (!res.ok) throw new Error('Failed to update menu');
      return res.json();
    },
    onSuccess: (updatedMenu: Menu) => {
      // Update the menu in the list
      const updatedMenus = menus.map(menu =>
        menu.id === updatedMenu.id ? updatedMenu : menu
      );
      onMenusChange(updatedMenus);
      setEditingMenu(null);
      setShowEditMenuSheet(false);
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      toast.success(t('menu_updated_success', 'Menu updated successfully!'));
    },
    onError: (error: unknown) => {
      const message = typeof error === 'object' && error !== null && 'message' in error ? (error as { message?: string }).message : String(error);
      toast.error(message || t('menu_update_failed', 'Failed to update menu'));
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

  // Function to handle editing a menu
  function handleEditMenu(menu: Menu) {
    setEditingMenu(menu);
    setShowEditMenuSheet(true);
  }

  // Function to save edited menu
  function saveEditedMenu() {
    if (!editingMenu) return;

    // Validate the edited menu
    if (!editingMenu.name) {
      toast.error(t('enter_menu_name', 'Please enter a menu name.'));
      return;
    }
    if (!editingMenu.category) {
      toast.error(t('select_category', 'Please select a category.'));
      return;
    }
    if (!editingMenu.ingredients || editingMenu.ingredients.length === 0) {
      toast.error(t('add_at_least_one_ingredient', 'Please add at least one ingredient.'));
      return;
    }

    // Ensure all ingredients have the required properties
    const validatedIngredients = editingMenu.ingredients.map(ing => ({
      ...ing,
      id: ing.id || '',
      name: ing.name || '',
      carbs: typeof ing.carbs === 'number' ? ing.carbs : 0,
      protein: typeof ing.protein === 'number' ? ing.protein : 0,
      fat: typeof ing.fat === 'number' ? ing.fat : 0,
      weight: typeof ing.weight === 'number' ? ing.weight : 0
    } as Ingredient));

    updateMenuMutation.mutate({
      id: editingMenu.id,
      name: editingMenu.name,
      category: editingMenu.category,
      personId,
      ingredients: validatedIngredients
    });
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* First column - Menu building form */}
      <div className="rounded-lg border border-border p-4 bg-card text-card-foreground shadow-sm">
        <h3 className="font-medium mb-2">{t('new_menu', 'New Menu')}</h3>
        <div className="space-y-4">
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
            <div className="flex flex-col sm:flex-row items-start gap-2 mb-1">
              <div className="w-full">
                <IngredientSearch
                  key={`ingredient-search-${ingredients.length}`} // Add a key that changes when ingredients are added
                  onIngredientSelect={(ingredient) => setSelectedIngredient(ingredient)}
                  selectedIngredient={selectedIngredient}
                  placeholder={t('search_ingredients', 'Search ingredients')}
                />
              </div>
              <div className="flex w-full">
                <div className="w-1/2 sm:w-24">
                  <Input
                    type="number"
                    value={ingredientWeight || ''}
                    onChange={e => setIngredientWeight(parseInt(e.target.value) || 0)}
                    placeholder={getUnitPlaceholder(selectedIngredient?.unit)}
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
                      className="ml-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {t('add_ingredient', 'Add ingredient')}
                  </TooltipContent>
                </Tooltip>
              </div>

            </div>
            {isDuplicate && (
              <div className="text-destructive text-sm mt-1 flex items-center gap-1" role="alert">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01m-6.938 2h13.856c1.54 0 2.502-1.667 1.732-3L13.732 5c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
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
                <span>{t(`ingredient_${ing.name ? ing.name.toLowerCase().replace(/\s+/g, '_') : ''}`, ing.name)} — {ing.weight}{getUnitAbbreviation(ing)}</span>
                <span className="text-xs text-muted-foreground">
                  {/* Calculate nutrition values based on weight/units */}
                  {(() => {
                    // Base values are per 100g/ml or per unit
                    const baseAmount = ing.unit === 'GRAM' || ing.unit === 'ML' ? 100 : 1;
                    const weight = typeof ing.weight === 'number' ? ing.weight : 0;
                    const multiplier = weight / baseAmount;

                    // Calculate the scaled nutrition values
                    const scaledCarbs = (ing.carbs * multiplier).toFixed(1);
                    const scaledProtein = (ing.protein * multiplier).toFixed(1);
                    const scaledFat = (ing.fat * multiplier).toFixed(1);

                    return `${scaledCarbs}g ${t('carbs', 'carbs')}, ${scaledProtein}g ${t('protein', 'protein')}, ${scaledFat}g ${t('fat', 'fat')}`;
                  })()}
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
              {menusLoading ? (
                <p className="text-sm text-muted-foreground">{t('loading_menus', 'Loading menus...')}</p>
              ) : menusError ? (
                <p className="text-sm text-destructive">{t('error_loading_menus', 'Error loading menus')}</p>
              ) : unassignedMenus.length === 0 ? (
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
                          {menu.category && (
                            <span className="inline-block text-xs rounded bg-muted px-2 py-0.5">
                              {menu.category}
                            </span>
                          )}
                          <div className="flex gap-1">
                            {/* Edit button */}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-primary hover:bg-primary/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMenu(menu);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            </Button>
                            {/* Delete button */}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6 text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConfirm(menu.id);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                            </Button>
                          </div>
                        </div>
                        {menu.ingredients && menu.ingredients.length > 0 && (
                          <ul className="text-xs text-muted-foreground pl-4 list-disc">
                            {menu.ingredients.map((ingredient: Ingredient, idx: number) => (
                              <li key={idx}>
                                {ingredient.name}
                                {ingredient.weight ? ` (${ingredient.weight}${getUnitAbbreviation(ingredient)})` : ""}
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
        <SheetContent className="px-6">
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
                          newIngredients[editingIngredientIndex] = ensureValidIngredient({
                            ...ingredient,
                            // Preserve the weight from the original ingredient
                            weight: newIngredients[editingIngredientIndex].weight,
                            // Preserve the unit from the original ingredient if available
                            unit: ingredient.unit || newIngredients[editingIngredientIndex].unit
                          });
                          setIngredients(newIngredients);

                          // Force a re-render to update the label
                          setEditingIngredientIndex(prevIndex => {
                            if (prevIndex !== null) {
                              return prevIndex;
                            }
                            return null;
                          });
                        }
                      }}
                      selectedIngredient={ingredients[editingIngredientIndex]}
                      placeholder={t('search_ingredients', 'Search ingredients')}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="edit-ingredient-weight" className="text-right">
                    {getUnitLabel(ingredients[editingIngredientIndex].unit, ingredients[editingIngredientIndex].name)}:
                  </label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Input
                      id="edit-ingredient-weight"
                      type="number"
                      value={ingredients[editingIngredientIndex].weight}
                      className="flex-1"
                      onChange={(e) => {
                        const newIngredients = [...ingredients];
                        newIngredients[editingIngredientIndex] = {
                          ...newIngredients[editingIngredientIndex],
                          weight: Number(e.target.value)
                        };
                        setIngredients(newIngredients);
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {getUnitPlaceholder(ingredients[editingIngredientIndex].unit, ingredients[editingIngredientIndex].name)}
                    </span>
                  </div>
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

      {/* Edit Menu Sheet */}
      <Sheet open={showEditMenuSheet} onOpenChange={setShowEditMenuSheet}>
        <SheetContent className="sm:max-w-md md:max-w-lg px-6">
          <SheetHeader>
            <SheetTitle>{t('edit_menu', 'Edit Menu')}</SheetTitle>
          </SheetHeader>
          <div className="py-4 space-y-4">
            {editingMenu && (
              <div className="space-y-4 w-full">
                <div>
                  <label htmlFor="edit-category" className="block text-sm font-medium mb-1">
                    {t('category', 'Category')}
                  </label>
                  <Select
                    value={editingMenu.category || ''}
                    onValueChange={value => setEditingMenu({ ...editingMenu, category: value })}
                  >
                    <SelectTrigger id="edit-category">
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
                  <label className="block text-sm font-medium mb-1">
                    {t('ingredients', 'Ingredients')}
                  </label>
                  <div className="flex flex-col sm:flex-row items-start gap-2 mb-1">
                    <div className="flex-1 w-full">
                      <IngredientSearch
                        key={`edit-ingredient-search-${editingMenu.ingredients?.length || 0}`}
                        onIngredientSelect={(ingredient) => setSelectedIngredient(ingredient)}
                        selectedIngredient={selectedIngredient}
                        placeholder={t('search_ingredients', 'Search ingredients')}
                      />
                    </div>
                    <div className="flex w-full">
                      <div className="w-full">
                        <Input
                          type="number"
                          value={ingredientWeight || ''}
                          onChange={e => setIngredientWeight(parseInt(e.target.value) || 0)}
                          placeholder={getUnitPlaceholder(selectedIngredient?.unit, selectedIngredient?.name)}
                          disabled={!selectedIngredient}
                        />
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            onClick={() => {
                              if (!selectedIngredient || ingredientWeight <= 0 || isDuplicate || !editingMenu) return;

                              // Add the ingredient to the menu's ingredients list with proper type
                              const newIngredient = ensureValidIngredient({
                                ...selectedIngredient,
                                weight: ingredientWeight
                              });

                              setEditingMenu({
                                ...editingMenu,
                                ingredients: [...(editingMenu.ingredients || []), newIngredient]
                              });

                              // Clear the selected ingredient
                              setSelectedIngredient(null);

                              // Reset the ingredient weight
                              setIngredientWeight(0);
                            }}
                            disabled={!selectedIngredient || ingredientWeight <= 0 || isDuplicate}
                            size="icon"
                            className="ml-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {t('add_ingredient', 'Add ingredient')}
                        </TooltipContent>
                      </Tooltip>
                    </div>

                  </div>
                </div>
                <ul className="list-disc ml-6 mt-2 text-sm">
                  {editingMenu.ingredients && editingMenu.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center gap-3 py-2">
                      <div className="flex gap-1">
                        {/* Edit button */}
                        <button
                          type="button"
                          aria-label="Edit ingredient"
                          title="Edit ingredient"
                          className="text-primary hover:bg-primary/10 rounded-full p-1"
                          onClick={() => {
                            // Set up editing for this ingredient
                            const ingredientToEdit = editingMenu.ingredients?.[idx];
                            if (ingredientToEdit) {
                              // Create a temporary copy of the ingredient for editing
                              const tempIngredients: Ingredient[] = [];
                              tempIngredients[0] = ensureValidIngredient({
                                ...ingredientToEdit,
                                // Ensure the weight is a number
                                weight: typeof ingredientToEdit.weight === 'number' ? ingredientToEdit.weight : 0,
                                // Ensure the unit is preserved
                                unit: ingredientToEdit.unit || 'GRAM'
                              });
                              setIngredients(tempIngredients);
                              setEditingIngredientIndex(0);
                              setShowEditIngredientSheet(true);

                              // Store the current ingredient index for reference
                              currentEditingMenuIngredientIndex.current = idx;
                            }
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
                            const updatedIngredients = (editingMenu.ingredients || []).filter((_, i) => i !== idx);
                            setEditingMenu({
                              ...editingMenu,
                              ingredients: updatedIngredients
                            });
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                      <div className="flex-1 flex flex-col">
                        <span>{t(`ingredient_${ing.name ? ing.name.toLowerCase().replace(/\s+/g, '_') : ''}`, ing.name)} — {ing.weight}{getUnitAbbreviation(ing)}</span>
                        <span className="text-xs text-muted-foreground">
                          {/* Calculate nutrition values based on weight/units */}
                          {(() => {
                            // Base values are per 100g/ml or per unit
                            const baseAmount = ing.unit === 'GRAM' || ing.unit === 'ML' ? 100 : 1;
                            const weight = typeof ing.weight === 'number' ? ing.weight : 0;
                            const multiplier = weight / baseAmount;

                            // Calculate the scaled nutrition values
                            const scaledCarbs = (ing.carbs * multiplier).toFixed(1);
                            const scaledProtein = (ing.protein * multiplier).toFixed(1);
                            const scaledFat = (ing.fat * multiplier).toFixed(1);

                            return `${scaledCarbs}g ${t('carbs', 'carbs')}, ${scaledProtein}g ${t('protein', 'protein')}, ${scaledFat}g ${t('fat', 'fat')}`;
                          })()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">{t('cancel', 'Cancel')}</Button>
            </SheetClose>
            <Button
              onClick={saveEditedMenu}
              disabled={updateMenuMutation.isPending}
            >
              {updateMenuMutation.isPending ? t('saving', 'Saving...') : t('save_changes', 'Save Changes')}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('confirm_delete', 'Confirm Delete')}</DialogTitle>
            <DialogDescription>
              {t('delete_menu_confirmation', 'Are you sure you want to delete this menu? This action cannot be undone.')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={cancelDeleteMenu}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDeleteMenu}>
              {t('confirm', 'Confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MenuBuilder;
