import { CHEMICAL_FORMULATIONS, ChemicalFormulation, isOldChemicalType, migrateChemicalType } from '@/constants/chemical-formulations';

// Thai descriptions for each chemical formulation
const THAI_DESCRIPTIONS = {
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
  STICK: 'สารยึดเกาะ',
  SPREAD: 'สารขยายพื้นที่'
} as const;

/**
 * Get label for chemical type with Thai description
 * Format: "ABBREVIATION (Thai description)"
 */
export async function getTypeLabel(type: string): Promise<string> {
  // Handle empty or null values
  if (!type) {
    return '';
  }

  // If it's an old type, migrate it first
  if (isOldChemicalType(type)) {
    const newType = migrateChemicalType(type);
    return `${newType} (${THAI_DESCRIPTIONS[newType]})`;
  }

  // Check if it's a valid new type
  if (type in THAI_DESCRIPTIONS) {
    const abbreviation = type as ChemicalFormulation;
    return `${abbreviation} (${THAI_DESCRIPTIONS[abbreviation]})`;
  }

  // Return as-is for unknown types
  return type;
}

/**
 * Get Thai description only (without abbreviation)
 */
export function getTypeThaiDescription(type: ChemicalFormulation): string {
  return THAI_DESCRIPTIONS[type] || type;
}

/**
 * Get English description for a chemical formulation
 */
export function getTypeEnglishDescription(type: ChemicalFormulation): string {
  return CHEMICAL_FORMULATIONS[type];
}

/**
 * Check if a type is a valid new chemical formulation
 */
export function isValidChemicalType(type: string): type is ChemicalFormulation {
  return type in CHEMICAL_FORMULATIONS;
}

/**
 * Get all available chemical types with their labels
 */
export function getAllChemicalTypes(): Array<{ value: ChemicalFormulation; label: string }> {
  return Object.entries(CHEMICAL_FORMULATIONS).map(([value]) => ({
    value: value as ChemicalFormulation,
    label: `${value} (${THAI_DESCRIPTIONS[value as ChemicalFormulation]})`
  }));
}