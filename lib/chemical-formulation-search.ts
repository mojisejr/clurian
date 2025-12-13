/**
 * Chemical Formulation Search and Filter Utilities
 *
 * Provides search functionality for the 46 chemical formulation types
 * with support for searching by code, English description, and Thai description
 */

import {
  CHEMICAL_FORMULATIONS,
  ChemicalFormulation,
  POWDER_FORMULATIONS,
  LIQUID_FORMULATIONS,
  SPECIAL_FORMULATIONS,
  FERTILIZER_FORMULATIONS,
  ADJUVANT_FORMULATIONS,
  ADDITIONAL_FORMULATIONS,
  getFormulationCategory as getFormulationCategoryFromConstants
} from '@/constants/chemical-formulations';
import { getTypeThaiDescription, getTypeEnglishDescription } from '@/lib/chemical-types';

export interface FormulationOption {
  type: ChemicalFormulation;
  englishDescription: string;
  thaiDescription: string;
  category: string;
}

/**
 * Get all formulations with their descriptions and categories
 */
export function getAllFormulationOptions(): ReadonlyArray<FormulationOption> {
  const formulations: FormulationOption[] = [];

  for (const type of Object.keys(CHEMICAL_FORMULATIONS) as ChemicalFormulation[]) {
    formulations.push({
      type,
      englishDescription: getTypeEnglishDescription(type),
      thaiDescription: getTypeThaiDescription(type),
      category: getFormulationCategory(type)
    });
  }

  return formulations;
}

/**
 * Search formulations by code or description
 *
 * @param query - Search query string
 * @returns Array of matching formulation options
 */
export function searchFormulations(query: string): ReadonlyArray<FormulationOption> {
  if (!query || query.trim().length === 0) {
    return getAllFormulationOptions();
  }

  const normalizedQuery = query.toLowerCase().trim();
  const allFormulations = getAllFormulationOptions();

  return allFormulations.filter(formulation => {
    // Search by code (exact match优先)
    if (formulation.type.toLowerCase() === normalizedQuery) {
      return true;
    }

    // Search by English description
    if (formulation.englishDescription.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    // Search by Thai description
    if (formulation.thaiDescription.includes(normalizedQuery)) {
      return true;
    }

    return false;
  });
}

/**
 * Filter formulations by category
 *
 * @param category - Category to filter by
 * @returns Array of formulation options in the specified category
 */
export function filterByCategory(category: string): ReadonlyArray<FormulationOption> {
  const allFormulations = getAllFormulationOptions();

  if (category === 'All' || !category) {
    return allFormulations;
  }

  return allFormulations.filter(formulation => formulation.category === category);
}

/**
 * Get formulation suggestions for autocomplete
 *
 * @param query - Partial search query
 * @param limit - Maximum number of suggestions to return
 * @returns Array of formulation suggestions
 */
export function getFormulationSuggestions(query: string, limit: number = 5): ReadonlyArray<FormulationOption> {
  if (!query || query.trim().length === 0) {
    // Return common formulations when no query
    return getCommonFormulations().slice(0, limit);
  }

  const results = searchFormulations(query);

  // Prioritize exact code matches
  const exactMatches = results.filter(f => f.type.toLowerCase() === query.toLowerCase());
  const partialMatches = results.filter(f => f.type.toLowerCase() !== query.toLowerCase());

  return [...exactMatches, ...partialMatches].slice(0, limit);
}

/**
 * Get commonly used formulations
 * These are formulations frequently used in Thai agriculture
 */
export function getCommonFormulations(): ReadonlyArray<FormulationOption> {
  const commonTypes: ChemicalFormulation[] = [
    // Most common powder formulations
    'WP', 'SP', 'SG',
    // Most common liquid formulations
    'EC', 'SL', 'SC',
    // Most common special formulations
    'EW', 'ME',
    // Common fertilizers
    'FERT', 'LIQ_FERT',
    // Common adjuvants
    'SURF'
  ];

  return commonTypes.map(type => ({
    type,
    englishDescription: getTypeEnglishDescription(type),
    thaiDescription: getTypeThaiDescription(type),
    category: getFormulationCategory(type)
  }));
}

/**
 * Get category with count
 *
 * @returns Array of categories with their formulation counts
 */
export function getCategoriesWithCount(): ReadonlyArray<{ category: string; count: number; order: number }> {
  return [
    { category: 'Powder', count: POWDER_FORMULATIONS.length, order: 1 },
    { category: 'Liquid', count: LIQUID_FORMULATIONS.length, order: 2 },
    { category: 'Special', count: SPECIAL_FORMULATIONS.length, order: 3 },
    { category: 'Fertilizer', count: FERTILIZER_FORMULATIONS.length, order: 4 },
    { category: 'Adjuvant', count: ADJUVANT_FORMULATIONS.length, order: 5 },
    { category: 'Additional', count: ADDITIONAL_FORMULATIONS.length, order: 6 }
  ];
}

/**
 * Get the category of a formulation type
 * Re-export from constants for convenience
 */
function getFormulationCategory(type: ChemicalFormulation): string {
  return getFormulationCategoryFromConstants(type);
}

/**
 * Debounce function to limit API calls during search
 */
export function debounce<T extends unknown[]>(func: (...args: T) => void, delay: number): (...args: T) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}