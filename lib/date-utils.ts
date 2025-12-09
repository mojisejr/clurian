/**
 * Date utility functions for Clurian Orchard Manager
 * Handles date comparisons and formatting for Thai locale
 */

import type { Log } from '@/lib/types';

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date string is in the past (before today)
 */
export function isOverdue(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();

  // Set time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date < today;
}

/**
 * Check if a date string is in the future (after today)
 */
export function isUpcoming(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();

  // Set time to start of day for accurate comparison
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date > today;
}

/**
 * Get relative date label in Thai
 */
export function getRelativeDateLabel(dateString: string): string {
  if (isOverdue(dateString)) {
    return 'เลยกำหนด';
  }

  if (isToday(dateString)) {
    return 'วันนี้';
  }

  if (isUpcoming(dateString)) {
    const date = new Date(dateString);
    const today = new Date();

    // Calculate difference in days
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `อีก ${diffDays} วัน`;
  }

  return formatDateThai(dateString);
}

/**
 * Format date in Thai format (DD/MM/YYYY with Buddhist era)
 */
export function formatDateThai(dateString: string): string {
  try {
    const date = new Date(dateString);

    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return dateString;
    }

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() + 543; // Convert to Buddhist era

    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Group activities by their relative date status
 */
export function groupActivitiesByDate(activities: Log[]) {
  const grouped = {
    overdue: [] as Log[],
    today: [] as Log[],
    upcoming: [] as Log[],
  };

  for (const activity of activities) {
    // Skip activities without followUpDate
    if (!activity.followUpDate) continue;

    if (isOverdue(activity.followUpDate)) {
      grouped.overdue.push(activity);
    } else if (isToday(activity.followUpDate)) {
      grouped.today.push(activity);
    } else if (isUpcoming(activity.followUpDate)) {
      grouped.upcoming.push(activity);
    }
  }

  // Sort upcoming activities by date (earliest first)
  grouped.upcoming.sort((a, b) => {
    const dateA = new Date(a.followUpDate!);
    const dateB = new Date(b.followUpDate!);
    return dateA.getTime() - dateB.getTime();
  });

  // Sort overdue activities by date (most overdue first)
  grouped.overdue.sort((a, b) => {
    const dateA = new Date(a.followUpDate!);
    const dateB = new Date(b.followUpDate!);
    return dateA.getTime() - dateB.getTime();
  });

  return grouped;
}

/**
 * Format a date range in Thai
 */
export function formatDateRangeThai(startDate: string, endDate: string): string {
  const start = formatDateThai(startDate);
  const end = formatDateThai(endDate);
  return `${start} - ${end}`;
}

/**
 * Get Thai month name
 */
export function getThaiMonthName(monthIndex: number): string {
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
    'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
    'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  return months[monthIndex] || '';
}

/**
 * Format date with full month name in Thai
 */
export function formatDateThaiFull(dateString: string): string {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString;
    }

    const day = date.getDate();
    const month = getThaiMonthName(date.getMonth());
    const year = date.getFullYear() + 543;

    return `${day} ${month} ${year}`;
  } catch {
    return dateString;
  }
}