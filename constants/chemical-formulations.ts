// Standard Agricultural Chemical Formulation Types
// Using international abbreviations with Thai descriptions

export const CHEMICAL_FORMULATIONS = {
  // Powder formulations
  WP: 'Wettable Powder',              // ผงชุ่มน้ำ
  WDG: 'Water Dispersible Granule',  // เม็ดกระเจิงในน้ำ
  GR: 'Granule',                     // เม็ด
  DF: 'Dustable Formulation',        // ผงโป๊ย
  FDF: 'Flowable Dust-Free Powder',  // ผงไหลไร้ฝุ่น

  // Liquid formulations
  EC: 'Emulsifiable Concentrate',    // เข้มข้นอิมัลชัน
  SC: 'Suspension Concentrate',      // แขวนลอยเข้มข้น
  SL: 'Soluble Liquid',              // ละลายน้ำได้
  EW: 'Emulsion in Water',           // อิมัลชันในน้ำ
  ME: 'Micro Emulsion',              // ไมโครอิมัลชัน

  // Special formulations
  CS: 'Capsule Suspension',          // แคปซูลแขวนลอย
  WG: 'Water Granule',               // เม็ดในน้ำ
  FS: 'Flowable Concentrate',        // ของเหลวไหล
  SE: 'Suspo Emulsion',              // ซัสโปอิมัลชัน

  // Fertilizers
  FERT: 'Fertilizer',                // ปุ๋ยเคมี
  ORG: 'Organic Fertilizer',         // ปุ๋ยอินทรีย์
  LIQ_FERT: 'Liquid Fertilizer',     // ปุ๋ยน้ำ

  // Adjuvants
  SURF: 'Surfactant',                // สารลดแรงตึงผิว
  STICK: 'Sticker',                  // สารยึดเกาะ
  SPREAD: 'Spreader'                 // สารขยายพื้นที่
} as const;

// Type for chemical formulation abbreviations
export type ChemicalFormulation = keyof typeof CHEMICAL_FORMULATIONS;

// Migration mapping from old Thai types to new abbreviations
export const TYPE_MIGRATION_MAP = {
  'chelator': 'SC',
  'suspended': 'SC',
  'liquid': 'SL',
  'fertilizer': 'FERT',
  'adjuvant': 'SURF',
  'oil_concentrate': 'EC',
  'oil': 'ME'
} as const;

// Old type for backward compatibility
export type OldChemicalType = 'chelator' | 'suspended' | 'liquid' | 'fertilizer' | 'adjuvant' | 'oil_concentrate' | 'oil';

// Check if a type is an old type that needs migration
export function isOldChemicalType(type: string): type is OldChemicalType {
  return type in TYPE_MIGRATION_MAP;
}

// Migrate old type to new abbreviation
export function migrateChemicalType(oldType: OldChemicalType): ChemicalFormulation {
  return TYPE_MIGRATION_MAP[oldType];
}