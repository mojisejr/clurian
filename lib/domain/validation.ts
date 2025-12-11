import { UITreeStatus } from './mappers';

// Validate TreeStatus values (uppercase)
export const validateTreeStatus = (status: string): boolean => {
  return ['HEALTHY', 'SICK', 'DEAD', 'ARCHIVED'].includes(status);
};

// Validate UI status values (lowercase)
export const validateUIStatus = (status: string): status is UITreeStatus => {
  return ['healthy', 'sick', 'dead', 'archived'].includes(status);
};