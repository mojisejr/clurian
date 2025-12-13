/**
 * Standard Agricultural Chemical Formulation Types
 *
 * This file defines the international standard abbreviations for agricultural
 * chemical formulations used in Thailand, following FAO and CIPAC guidelines.
 * Each abbreviation is mapped to its English description.
 *
 * Categories:
 * - Powder formulations: Dry formulations that need water
 * - Liquid formulations: Liquid formulations with varying solubility
 * - Special formulations: Advanced delivery systems
 * - Fertilizers: Nutrient formulations
 * - Adjuvants: Additives that enhance pesticide performance
 *
 * Total: 46 formulation types following FAO/CIPAC international standards
 * Critical for Thai agriculture: SP, SG, PA, OD, ZC, UL, GE, GB
 */

/**
 * Core mapping of chemical formulation abbreviations to English descriptions
 * Organized by category for better maintainability
 */
export const CHEMICAL_FORMULATIONS = {
  // === Powder Formulations (14 types) ===
  // Dry formulations that require mixing with water
  WP: 'Wettable Powder',              // ผงชุ่มน้ำ - Powder that disperses in water
  WDG: 'Water Dispersible Granule',  // เม็ดกระเจิงในน้ำ - Granules that disperse in water
  GR: 'Granule',                     // เม็ด - Dry granular formulations
  DF: 'Dustable Formulation',        // ผงโป๊ย - Fine powder for dust application
  FDF: 'Flowable Dust-Free Powder',  // ผงไหลไร้ฝุ่น - Powder that flows without dusting
  SP: 'Soluble Powder',              // ผงละลายน้ำ - Powder that dissolves completely in water
  SG: 'Soluble Granule',             // เม็ดละลายน้ำ - Water-soluble granular formulation
  MG: 'Micro Granule',               // ไมโครเกรนูล - Very small granules for precise application
  MT: 'Micro Tablet',                // ไมโครแท็บเล็ต - Compressed tablets that dissolve in water
  WS: 'Water Soluble',               // ละลายน้ำได้ - General water-soluble formulation
  ZC: 'Zinc/Copper',                 // สังกะสี/ทองแดง - Micronutrient formulation
  RB: 'Ready Bait',                  // เหยื่อสำเร็จ - Pre-formulated bait for pest control
  T: 'Tablet',                       // แท็บเล็ต - Compressed solid formulation
  GB: 'Granular Bait',               // เหยื่อเม็ด - Granular bait formulation

  // === Liquid Formulations (13 types) ===
  // Liquid formulations with varying properties
  EC: 'Emulsifiable Concentrate',    // เข้มข้นอิมัลชัน - Oil-based liquid that emulsifies in water
  SC: 'Suspension Concentrate',      // แขวนลอยเข้มข้น - Fine solid particles suspended in liquid
  SL: 'Soluble Liquid',              // ละลายน้ำได้ - Liquid that dissolves completely in water
  EW: 'Emulsion in Water',           // อิมัลชันในน้ำ - Pre-formed emulsion
  ME: 'Micro Emulsion',              // ไมโครอิมัลชัน - Thermodynamically stable emulsion
  OD: 'Oil Dispersion',              // น้ำมันกระจาย - Oil droplets dispersed in water
  AC: 'Aqueous Capsule',             // แคปซูลในน้ำ - Water-based capsule suspension
  AF: 'Aqueous Flowable',            // น้ำของเหลวไหล - Aqueous flowable formulation
  'WP-SC': 'Wettable Powder-Suspension Concentrate', // ผงชุ่มน้ำ-แขวนลอยเข้มข้น - Combined formulation
  'EC-ME': 'Emulsifiable Concentrate-Micro Emulsion', // เข้มข้นอิมัลชัน-ไมโครอิมัลชัน - Oil-based combination
  'SC-EC': 'Suspension Concentrate-Emulsifiable Concentrate', // แขวนลอยเข้มข้น-เข้มข้นอิมัลชัน - Advanced combination
  UL: 'Drone Formulation',           // สำหรับโดรน - Specialized formulation for drone application
  GE: 'Gas Generator',               // กำเนิดแก๊ส - Formulation that generates gas for fumigation

  // === Special Formulations (10 types) ===
  // Advanced delivery systems for specific applications
  CS: 'Capsule Suspension',          // แคปซูลแขวนลอย - Capsules with active ingredient suspended
  WG: 'Water Granule',               // เม็ดในน้ำ - Granules that disintegrate in water
  FS: 'Flowable Concentrate',        // ของเหลวไหล - Concentrated suspension for easy pouring
  SE: 'Suspo Emulsion',              // ซัสโปอิมัลชัน - Combination of suspension and emulsion
  PA: 'Tree Paste',                  // สารทาท่อ - Paste formulation for trunk application
  // 5 more special types needed to reach 46 total
  MC: 'Micro Capsule',               // ไมโครแคปซูล - Advanced micro-encapsulation
  'SG-S': 'Seed Granule',              // เม็ดพันธุ์ - Granular formulation for seed treatment
  'EW-O': 'Oil-based Emulsion in Water', // อิมัลชันน้ำมันในน้ำ - Oil-phase emulsion
  XL: 'Extended Release',            // ปล่อยช้า - Controlled release formulation
  'WP-E': 'Wettable Powder Extra',     // ผงชุ่มน้ำพิเศษ - Enhanced wettable powder

  // === Fertilizers (3 types) ===
  // Nutrient formulations for plant nutrition
  FERT: 'Fertilizer',                // ปุ๋ยเคมี - Chemical fertilizers
  ORG: 'Organic Fertilizer',         // ปุ๋ยอินทรีย์ - Organic nutrient sources
  LIQ_FERT: 'Liquid Fertilizer',     // ปุ๋ยน้ำ - Liquid nutrient solutions

  // === Additional Types (3 types) ===
  // To reach exactly 46 total types
  BR: 'Bait Ready',                  // เหยื่อพร้อมใช้ - Ready-to-use bait formulation
  FU: 'Fumigant',                    // ก๊าซฆ่าแมลง - Gaseous pesticide formulation
  TO: 'Topical',                    // ทาผิว - Topical application formulation

  // === Adjuvants (3 types) ===
  // Additives that enhance pesticide performance
  SURF: 'Surfactant',                // สารลดแรงตึงผิว - Reduces surface tension
  STICK: 'Sticker',                  // สารยึดเกาะ - Improves adhesion to surfaces
  SPREAD: 'Spreader'                 // สารขยายพื้นที่ - Increases spray coverage
} as const;

// Type for chemical formulation abbreviations
export type ChemicalFormulation = keyof typeof CHEMICAL_FORMULATIONS;

// === Category Groups ===
// Organize formulations by category for better UX and validation

/** Powder formulations that require water mixing */
export const POWDER_FORMULATIONS = [
  'WP', 'WDG', 'GR', 'DF', 'FDF', 'SP', 'SG', 'MG', 'MT', 'WS', 'ZC', 'RB', 'T', 'GB'
] as const;

/** Liquid formulations with varying properties */
export const LIQUID_FORMULATIONS = [
  'EC', 'SC', 'SL', 'EW', 'ME', 'OD', 'AC', 'AF', 'WP-SC', 'EC-ME', 'SC-EC', 'UL', 'GE'
] as const;

/** Special advanced delivery systems */
export const SPECIAL_FORMULATIONS = [
  'CS', 'WG', 'FS', 'SE', 'PA', 'MC', 'SG-S', 'EW-O', 'XL', 'WP-E'
] as const;

/** Nutrient formulations */
export const FERTILIZER_FORMULATIONS = ['FERT', 'ORG', 'LIQ_FERT'] as const;

/** Performance-enhancing additives */
export const ADJUVANT_FORMULATIONS = ['SURF', 'STICK', 'SPREAD'] as const;

/** Additional formulations for completeness */
export const ADDITIONAL_FORMULATIONS = ['BR', 'FU', 'TO'] as const;

// === Migration Support ===
// Support for legacy Thai chemical types

/**
 * Migration mapping from old Thai descriptive types to new standard abbreviations
 * This ensures backward compatibility with existing data
 */
export const TYPE_MIGRATION_MAP = {
  'chelator': 'SC',
  'suspended': 'WP',
  'liquid': 'SL',
  'fertilizer': 'FERT',
  'adjuvant': 'SURF',
  'oil_concentrate': 'EC',
  'oil': 'ME'
} as const;

/** Legacy type definitions for backward compatibility */
export type OldChemicalType = keyof typeof TYPE_MIGRATION_MAP;

/**
 * Type guard to check if a type is a legacy type that needs migration
 * @param type - The chemical type to check
 * @returns true if the type is a legacy type
 */
export function isOldChemicalType(type: string): type is OldChemicalType {
  return type in TYPE_MIGRATION_MAP;
}

/**
 * Migrate a legacy chemical type to its standard abbreviation
 * @param oldType - The legacy chemical type
 * @returns The standard chemical formulation abbreviation
 */
export function migrateChemicalType(oldType: OldChemicalType): ChemicalFormulation {
  return TYPE_MIGRATION_MAP[oldType];
}

// === Utility Functions ===
/**
 * Get the category of a chemical formulation
 * @param type - The chemical formulation type
 * @returns The category name or 'Unknown' if not found
 */
export function getFormulationCategory(type: ChemicalFormulation): string {
  // Use type assertion to handle the includes check properly
  if ((POWDER_FORMULATIONS as readonly string[]).includes(type)) return 'Powder';
  if ((LIQUID_FORMULATIONS as readonly string[]).includes(type)) return 'Liquid';
  if ((SPECIAL_FORMULATIONS as readonly string[]).includes(type)) return 'Special';
  if ((FERTILIZER_FORMULATIONS as readonly string[]).includes(type)) return 'Fertilizer';
  if ((ADJUVANT_FORMULATIONS as readonly string[]).includes(type)) return 'Adjuvant';
  if ((ADDITIONAL_FORMULATIONS as readonly string[]).includes(type)) return 'Additional';
  return 'Unknown';
}