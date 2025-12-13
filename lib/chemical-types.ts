import {
  CHEMICAL_FORMULATIONS,
  ChemicalFormulation,
  isOldChemicalType,
  migrateChemicalType
} from '@/constants/chemical-formulations';

/**
 * Thai descriptions for each chemical formulation
 * Maps standard abbreviations to their Thai names for user interface
 */
const THAI_DESCRIPTIONS: Readonly<Record<ChemicalFormulation, string>> = {
  // Powder formulations
  WP: 'ผงชุ่มน้ำ',
  WDG: 'เม็ดกระเจิงในน้ำ',
  GR: 'เม็ด',
  DF: 'ผงโป๊ย',
  FDF: 'ผงไหลไร้ฝุ่น',

  // Liquid formulations
  EC: 'เข้มข้นอิมัลชัน',
  SC: 'แขวนลอยเข้มข้น',
  SL: 'สารละลายน้ำ',
  EW: 'อิมัลชันในน้ำ',
  ME: 'ไมโครอิมัลชัน',

  // Special formulations
  CS: 'แคปซูลแขวนลอย',
  WG: 'เม็ดในน้ำ',
  FS: 'ของเหลวไหล',
  SE: 'ซัสโปอิมัลชัน',

  // Fertilizers
  FERT: 'ปุ๋ยเคมี',
  ORG: 'ปุ๋ยอินทรีย์',
  LIQ_FERT: 'ปุ๋ยน้ำ',

  // Adjuvants
  SURF: 'สารลดแรงตึงผิว',
  STIK: 'สารยึดเกาะ',
  SPRD: 'สารขยายพื้นที่'
} as const;

/**
 * Union type for any valid chemical type (new or legacy)
 */
export type AnyChemicalType = ChemicalFormulation | keyof typeof THAI_DESCRIPTIONS;

/**
 * Get bilingual label for chemical type
 * Format: "ABBREVIATION (Thai description)"
 *
 * @param type - The chemical type (can be new or legacy)
 * @returns Promise resolving to formatted label or empty string for invalid input
 *
 * @example
 * ```typescript
 * await getTypeLabel('WP') // returns "WP (ผงชุ่มน้ำ)"
 * await getTypeLabel('chelator') // returns "SC (แขวนลอยเข้มข้น)"
 * await getTypeLabel('') // returns ""
 * ```
 */
export async function getTypeLabel(type: string | null | undefined): Promise<string> {
  // Handle null/undefined/empty values
  if (!type?.trim()) {
    return '';
  }

  // Normalize input
  const normalizedType = type.trim();

  // If it's a legacy type, migrate it first
  if (isOldChemicalType(normalizedType)) {
    const newType = migrateChemicalType(normalizedType);
    return `${newType} (${THAI_DESCRIPTIONS[newType]})`;
  }

  // Check if it's a valid new type
  if (isValidChemicalType(normalizedType)) {
    const abbreviation = normalizedType as ChemicalFormulation;
    return `${abbreviation} (${THAI_DESCRIPTIONS[abbreviation]})`;
  }

  // Return as-is for unknown types (maintains backward compatibility)
  return normalizedType;
}

/**
 * Get Thai description only (without abbreviation)
 *
 * @param type - Valid chemical formulation type
 * @returns Thai description or the type itself if not found
 *
 * @example
 * ```typescript
 * getTypeThaiDescription('WP') // returns "ผงชุ่มน้ำ"
 * ```
 */
export function getTypeThaiDescription(type: ChemicalFormulation): string {
  return THAI_DESCRIPTIONS[type];
}

/**
 * Get English description for a chemical formulation
 *
 * @param type - Valid chemical formulation type
 * @returns English description from CHEMICAL_FORMULATIONS
 *
 * @example
 * ```typescript
 * getTypeEnglishDescription('WP') // returns "Wettable Powder"
 * ```
 */
export function getTypeEnglishDescription(type: ChemicalFormulation): string {
  return CHEMICAL_FORMULATIONS[type];
}

/**
 * Type guard to check if a string is a valid chemical formulation type
 *
 * @param type - String to check
 * @returns true if the string is a valid ChemicalFormulation
 *
 * @example
 * ```typescript
 * if (isValidChemicalType(input)) {
 *   // TypeScript knows input is ChemicalFormulation here
 *   const description = getTypeEnglishDescription(input);
 * }
 * ```
 */
export function isValidChemicalType(type: string): type is ChemicalFormulation {
  return type in CHEMICAL_FORMULATIONS;
}

/**
 * Get all available chemical types formatted for UI selection
 * Returns array of objects with value and bilingual label
 *
 * @returns Array of chemical type options
 *
 * @example
 * ```typescript
 * const options = getAllChemicalTypes();
 * // returns:
 * // [
 * //   { value: 'WP', label: 'WP (ผงชุ่มน้ำ)' },
 * //   { value: 'EC', label: 'EC (เข้มข้นอิมัลชัน)' },
 * //   ...
 * // ]
 * ```
 */
export function getAllChemicalTypes(): ReadonlyArray<{ value: ChemicalFormulation; label: string }> {
  return Object.values(CHEMICAL_FORMULATIONS).map((_, index) => {
    // Using Object.values and index to maintain type safety
    const keys = Object.keys(CHEMICAL_FORMULATIONS) as ChemicalFormulation[];
    const value = keys[index];
    return {
      value,
      label: `${value} (${THAI_DESCRIPTIONS[value]})`
    };
  });
}

/**
 * Get the category of a chemical formulation
 * @param type - The chemical formulation type
 * @returns The category name or 'Unknown' if not found
 */
function getFormulationCategory(type: ChemicalFormulation): string {
  const powderTypes: ChemicalFormulation[] = ['WP', 'WDG', 'GR', 'DF', 'FDF'];
  const liquidTypes: ChemicalFormulation[] = ['EC', 'SC', 'SL', 'EW', 'ME'];
  const specialTypes: ChemicalFormulation[] = ['CS', 'WG', 'FS', 'SE'];
  const fertilizerTypes: ChemicalFormulation[] = ['FERT', 'ORG', 'LIQ_FERT'];
  const adjuvantTypes: ChemicalFormulation[] = ['SURF', 'STIK', 'SPRD'];

  if (powderTypes.includes(type)) return 'Powder';
  if (liquidTypes.includes(type)) return 'Liquid';
  if (specialTypes.includes(type)) return 'Special';
  if (fertilizerTypes.includes(type)) return 'Fertilizer';
  if (adjuvantTypes.includes(type)) return 'Adjuvant';
  return 'Unknown';
}

/**
 * Get chemical types by category for organized UI display
 *
 * @returns Object with categories as keys and arrays of type options
 *
 * @example
 * ```typescript
 * const byCategory = getChemicalTypesByCategory();
 * // returns:
 * // {
 * //   Powder: [
 * //     { value: 'WP', label: 'WP (ผงชุ่มน้ำ)', category: 'Powder' },
 * //     { value: 'WDG', label: 'WDG (เม็ดกระเจิงในน้ำ)', category: 'Powder' },
 * //     ...
 * //   ],
 * //   Liquid: [...],
 * //   ...
 * // }
 * ```
 */
export function getChemicalTypesByCategory(): Readonly<Record<string, ReadonlyArray<{
  value: ChemicalFormulation;
  label: string;
  category: string;
}>>> {
  const categories: Record<string, Array<{ value: ChemicalFormulation; label: string; category: string }>> = {};

  // Process all chemical types
  Object.values(CHEMICAL_FORMULATIONS).forEach((_, index) => {
    const keys = Object.keys(CHEMICAL_FORMULATIONS) as ChemicalFormulation[];
    const type = keys[index];
    const category = getFormulationCategory(type);

    if (!categories[category]) {
      categories[category] = [];
    }

    categories[category].push({
      value: type,
      label: `${type} (${THAI_DESCRIPTIONS[type]})`,
      category
    });
  });

  return categories;
}