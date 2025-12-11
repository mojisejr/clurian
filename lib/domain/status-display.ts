import { TreeStatus } from '@prisma/client';
import { UITreeStatus } from './mappers';

// Thai display labels for tree statuses
const STATUS_DISPLAY_THAI: Record<TreeStatus | UITreeStatus, string> = {
  // Database values (uppercase)
  HEALTHY: 'ปกติ',
  SICK: 'ป่วย/ดูแล',
  DEAD: 'ตาย',
  ARCHIVED: 'เลิกทำ',

  // UI values (lowercase)
  healthy: 'ปกติ',
  sick: 'ป่วย/ดูแล',
  dead: 'ตาย',
  archived: 'เลิกทำ'
};

// Get Thai display text for status
export const getTreeStatusDisplay = (status: TreeStatus | UITreeStatus): string => {
  return STATUS_DISPLAY_THAI[status] || status;
};

// Get all available status options for UI
export const getUIStatusOptions = (): Array<{ value: UITreeStatus; label: string }> => {
  return [
    { value: 'healthy', label: 'ปกติ' },
    { value: 'sick', label: 'ป่วย/ดูแล' },
    { value: 'dead', label: 'ตาย' },
    { value: 'archived', label: 'เลิกทำ' }
  ];
};