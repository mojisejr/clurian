/**
 * Chemical Formulation Templates Management
 *
 * Provides template management for common chemical formulations
 * including favorites and frequency tracking
 */

import { ChemicalFormulation } from '@/constants/chemical-formulations';
import { getFormulationSuggestions, FormulationOption } from '@/lib/chemical-formulation-search';

export interface FormulationTemplate {
  id: string;
  name: string;
  description?: string;
  type: ChemicalFormulation;
  frequency?: number; // Usage frequency for sorting
  isFavorite?: boolean;
  lastUsed?: Date;
}

export interface SavedFormula {
  id: string;
  name: string;
  description?: string;
  chemicals: Array<{
    name: string;
    type: ChemicalFormulation;
    quantity: number;
    unit: string;
  }>;
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
  isFavorite?: boolean;
}

/**
 * Get common formulations with usage frequency
 * These are based on typical usage patterns in Thai agriculture
 */
export function getCommonFormulations(): ReadonlyArray<FormulationTemplate> {
  const commonFormulations: FormulationTemplate[] = [
    // High frequency (>0.3)
    {
      id: 'wp-common',
      name: 'Wettable Powder',
      description: 'ผงชุ่มน้ำ - ใช้กันทั่วไป',
      type: 'WP',
      frequency: 0.35,
      isFavorite: false
    },
    {
      id: 'ec-common',
      name: 'Emulsifiable Concentrate',
      description: 'เข้มข้นอิมัลชัน - ยาฆ่าแมลง',
      type: 'EC',
      frequency: 0.30,
      isFavorite: false
    },

    // Medium frequency (0.2-0.3)
    {
      id: 'sl-common',
      name: 'Soluble Liquid',
      description: 'สารละลายน้ำใส - ปุ๋ยน้ำ',
      type: 'SL',
      frequency: 0.25,
      isFavorite: false
    },
    {
      id: 'sp-common',
      name: 'Soluble Powder',
      description: 'ผงละลายน้ำ - ปุ๋ยผง',
      type: 'SP',
      frequency: 0.20,
      isFavorite: false
    },

    // Lower frequency (<0.2)
    {
      id: 'sc-common',
      name: 'Suspension Concentrate',
      description: 'แขวนลอยเข้มข้น - ยาเข้มข้น',
      type: 'SC',
      frequency: 0.15,
      isFavorite: false
    },
    {
      id: 'me-common',
      name: 'Micro Emulsion',
      description: 'ไมโครอิมัลชัน - ยาน้ำมัน',
      type: 'ME',
      frequency: 0.10,
      isFavorite: false
    },
    {
      id: 'fert-common',
      name: 'Chemical Fertilizer',
      description: 'ปุ๋ยเคมี - สารอาหารพืช',
      type: 'FERT',
      frequency: 0.08,
      isFavorite: false
    },
    {
      id: 'surf-common',
      name: 'Surfactant',
      description: 'สารลดแรงตึงผิว - สารช่วย',
      type: 'SURF',
      frequency: 0.05,
      isFavorite: false
    }
  ];

  // Sort by frequency (highest first)
  return commonFormulations.sort((a, b) => (b.frequency || 0) - (a.frequency || 0));
}

/**
 * Save a formulation to favorites
 */
export async function saveToFavorites(formulation: {
  name: string;
  type: ChemicalFormulation;
  description?: string;
}): Promise<FormulationTemplate> {
  // In a real implementation, this would save to a database
  // For now, we'll simulate the save operation
  const favorite: FormulationTemplate = {
    id: `fav-${Date.now()}`,
    name: formulation.name,
    description: formulation.description,
    type: formulation.type,
    isFavorite: true,
    lastUsed: new Date()
  };

  // In localStorage or state management:
  const favorites = await getFavoriteFormulations();
  const updatedFavorites = [...favorites, favorite];

  // Save to localStorage (client-side only)
  if (typeof window !== 'undefined') {
    localStorage.setItem('chemical-favorites', JSON.stringify(updatedFavorites));
  }

  return favorite;
}

/**
 * Get favorite formulations
 */
export async function getFavoriteFormulations(): Promise<ReadonlyArray<FormulationTemplate>> {
  // In a real implementation, this would fetch from a database
  // For now, we'll use localStorage
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('chemical-favorites');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing favorites:', error);
      }
    }
  }

  return [];
}

/**
 * Remove a formulation from favorites
 */
export async function removeFromFavorites(formulationId: string): Promise<boolean> {
  const favorites = await getFavoriteFormulations();
  const filteredFavorites = favorites.filter(f => f.id !== formulationId);

  if (filteredFavorites.length < favorites.length) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chemical-favorites', JSON.stringify(filteredFavorites));
    }
    return true;
  }

  return false;
}

/**
 * Get template suggestions based on usage and favorites
 */
export function getTemplateSuggestions(
  query: string,
  limit: number = 5
): ReadonlyArray<FormulationTemplate> {
  // If no query, return top formulations by frequency
  if (!query.trim()) {
    return getCommonFormulations().slice(0, limit);
  }

  // Search through common formulations
  const common = getCommonFormulations();
  const matches = common.filter(template =>
    template.name.toLowerCase().includes(query.toLowerCase()) ||
    template.type.toLowerCase().includes(query.toLowerCase()) ||
    (template.description && template.description.toLowerCase().includes(query.toLowerCase()))
  );

  return matches.slice(0, limit);
}

/**
 * Save a complete formula for future use
 */
export async function saveFormula(formula: {
  name: string;
  description?: string;
  chemicals: Array<{
    name: string;
    type: ChemicalFormulation;
    quantity: number;
    unit: string;
  }>;
}): Promise<SavedFormula> {
  const savedFormula: SavedFormula = {
    id: `formula-${Date.now()}`,
    name: formula.name,
    description: formula.description,
    chemicals: formula.chemicals,
    createdAt: new Date(),
    useCount: 0,
    isFavorite: false
  };

  // In a real implementation, save to database
  // For now, use localStorage
  if (typeof window !== 'undefined') {
    const existing = await getSavedFormulas();
    const updated = [...existing, savedFormula];
    localStorage.setItem('chemical-formulas', JSON.stringify(updated));
  }

  return savedFormula;
}

/**
 * Get all saved formulas
 */
export async function getSavedFormulas(): Promise<ReadonlyArray<SavedFormula>> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('chemical-formulas');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing formulas:', error);
      }
    }
  }

  return [];
}

/**
 * Update formula usage statistics
 */
export async function updateFormulaUsage(formulaId: string): Promise<boolean> {
  const formulas = await getSavedFormulas();
  const formula = formulas.find(f => f.id === formulaId);

  if (formula) {
    formula.useCount += 1;
    formula.lastUsed = new Date();

    // Update in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('chemical-formulas', JSON.stringify(formulas));
    }
    return true;
  }

  return false;
}

/**
 * Get recently used formulas
 */
export async function getRecentFormulas(limit: number = 5): Promise<ReadonlyArray<SavedFormula>> {
  const formulas = await getSavedFormulas();

  // Sort by last used date (most recent first)
  const withLastUsed = formulas.filter(f => f.lastUsed);
  const sorted = withLastUsed.sort((a, b) =>
    new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime()
  );

  return sorted.slice(0, limit);
}

/**
 * Toggle formula favorite status
 */
export async function toggleFormulaFavorite(formulaId: string): Promise<boolean> {
  const formulas = await getSavedFormulas();
  const formula = formulas.find(f => f.id === formulaId);

  if (formula) {
    formula.isFavorite = !formula.isFavorite;

    if (typeof window !== 'undefined') {
      localStorage.setItem('chemical-formulas', JSON.stringify(formulas));
    }
    return true;
  }

  return false;
}

/**
 * Get favorite formulas
 */
export async function getFavoriteFormulas(): Promise<ReadonlyArray<SavedFormula>> {
  const formulas = await getSavedFormulas();
  return formulas.filter(f => f.isFavorite);
}