"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { getCategoriesWithCount } from '@/lib/chemical-formulation-search';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export function CategoryTabs({ activeCategory, onCategoryChange, className }: CategoryTabsProps) {
  const categories = getCategoriesWithCount();

  return (
    <div
      className={`flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg ${className}`}
      data-testid="category-tabs"
    >
      {/* All tab */}
      <Button
        variant={activeCategory === 'All' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onCategoryChange('All')}
        className={`text-xs ${
          activeCategory === 'All'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        data-testid="all-tab"
      >
        ทั้งหมด
      </Button>

      {/* Category tabs */}
      {categories.map((category) => (
        <Button
          key={category.category}
          variant={activeCategory === category.category ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onCategoryChange(category.category)}
          className={`text-xs ${
            activeCategory === category.category
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          data-testid={`${category.category.toLowerCase()}-tab`}
        >
          {category.category === 'Powder' && 'ผง'}
          {category.category === 'Liquid' && 'ของเหลว'}
          {category.category === 'Special' && 'พิเศษ'}
          {category.category === 'Fertilizer' && 'ปุ๋ย'}
          {category.category === 'Adjuvant' && 'สารช่วย'}
          {category.category === 'Additional' && 'อื่นๆ'} ({category.count})
        </Button>
      ))}
    </div>
  );
}