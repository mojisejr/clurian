import {
  CHEMICAL_FORMULATIONS,
  ChemicalFormulation,
  isOldChemicalType,
  migrateChemicalType,
  getFormulationCategory as getFormulationCategoryFromConstants
} from '@/constants/chemical-formulations';

/**
 * Thai descriptions for each chemical formulation
 * Maps standard abbreviations to their Thai names for user interface
 */
const THAI_DESCRIPTIONS: Readonly<Record<ChemicalFormulation, string>> = {
  // Powder formulations (14 types)
  WP: 'ผงชุ่มน้ำ',
  WDG: 'เม็ดกระเจิงในน้ำ',
  GR: 'เม็ด',
  DF: 'ผงโป๊ย',
  FDF: 'ผงไหลไร้ฝุ่น',
  SP: 'ผงละลายน้ำ',
  SG: 'เม็ดละลายน้ำ',
  MG: 'ไมโครเกรนูล',
  MT: 'ไมโครแท็บเล็ต',
  WS: 'ละลายน้ำได้',
  ZC: 'สังกะสี/ทองแดง',
  RB: 'เหยื่อสำเร็จ',
  TAB: 'แท็บเล็ต',
  GB: 'เหยื่อเม็ด',

  // Liquid formulations (13 types)
  EC: 'เข้มข้นอิมัลชัน',
  SC: 'แขวนลอยเข้มข้น',
  SL: 'สารละลายน้ำใส',
  EW: 'อิมัลชันในน้ำ',
  ME: 'ไมโครอิมัลชัน',
  OD: 'น้ำมันกระจาย',
  AC: 'แคปซูลในน้ำ',
  AF: 'น้ำของเหลวไหล',
  'WP-SC': 'ผงชุ่มน้ำ-แขวนลอยเข้มข้น',
  'EC-ME': 'เข้มข้นอิมัลชัน-ไมโครอิมัลชัน',
  'SC-EC': 'แขวนลอยเข้มข้น-เข้มข้นอิมัลชัน',
  UL: 'สำหรับโดรน',
  GE: 'กำเนิดแก๊ส',

  // Special formulations (10 types)
  CS: 'แคปซูลแขวนลอย',
  WG: 'เม็ดในน้ำ',
  FS: 'ของเหลวไหล',
  SE: 'ซัสโปอิมัลชัน',
  PA: 'สารทาท่อ',
  MC: 'ไมโครแคปซูล',
  'SGST': 'เม็ดพันธุ์',
  'EWOM': 'อิมัลชันน้ำมันในน้ำ',
  XL: 'ปล่อยช้า',
  'WPEX': 'ผงชุ่มน้ำพิเศษ',

  // Fertilizers (3 types)
  FERT: 'ปุ๋ยเคมี',
  ORG: 'ปุ๋ยอินทรีย์',
  LIQ_FERT: 'ปุ๋ยน้ำ',

  // Adjuvants (3 types)
  SURF: 'สารลดแรงตึงผิว',
  STIK: 'สารยึดเกาะ',
  SPRD: 'สารขยายพื้นที่',

  // Additional (3 types)
  BR: 'เหยื่อพร้อมใช้',
  FU: 'ก๊าซฆ่าแมลง',
  TO: 'ทาผิว'
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
  return getFormulationCategoryFromConstants(type);
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