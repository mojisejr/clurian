"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Star } from 'lucide-react';
import { CategoryTabs } from './CategoryTabs';
import { FormulationSearchBox } from './FormulationSearchBox';
import {
  searchFormulations,
  filterByCategory,
  // getCommonFormulations,
  type FormulationOption
} from '@/lib/chemical-formulation-search';
import {
  saveToFavorites,
  getFavoriteFormulations,
  type FormulationTemplate
} from '@/lib/chemical-templates';
import { ChemicalFormulation } from '@/constants/chemical-formulations';

interface ChemicalFormulationSelectorProps {
  onSelect: (formulation: ChemicalFormulation) => void;
  selectedType?: ChemicalFormulation;
  showTemplates?: boolean;
  showFavorites?: boolean;
  className?: string;
  maxHeight?: string;
}

export function ChemicalFormulationSelector({
  onSelect,
  selectedType,
  showTemplates = true,
  showFavorites = true,
  className,
  maxHeight = '400px'
}: ChemicalFormulationSelectorProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'category' | 'templates' | 'favorites'>('all');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<ChemicalFormulation[]>([]);

  // Load favorites from localStorage
  useEffect(() => {
    const loadFavorites = async () => {
      const favs = await getFavoriteFormulations();
      setFavorites(favs.map(f => f.type));
    };
    loadFavorites();
  }, []);

  // Filter formulations based on search and category
  const filteredFormulations = useMemo(() => {
    let formulations: FormulationOption[];

    if (activeTab === 'category' && activeCategory !== 'All') {
      formulations = [...filterByCategory(activeCategory)];
    } else if (searchQuery) {
      formulations = [...searchFormulations(searchQuery)];
    } else {
      formulations = [...searchFormulations('')];
    }

    return formulations;
  }, [activeTab, activeCategory, searchQuery]);

  // Get templates
  // const templates = useMemo(() => getCommonFormulations(), []);

  // Handle formulation selection
  const handleSelect = (formulation: FormulationOption) => {
    onSelect(formulation.type);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setActiveTab('category');
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setActiveTab('all');
    }
  };

  // Toggle favorite
  const toggleFavorite = async (e: React.MouseEvent, formulation: FormulationOption) => {
    e.stopPropagation();

    if (favorites.includes(formulation.type)) {
      // Remove from favorites
      setFavorites(prev => prev.filter(f => f !== formulation.type));
      // In real implementation, also update localStorage
    } else {
      // Add to favorites
      setFavorites(prev => [...prev, formulation.type]);
      await saveToFavorites({
        name: formulation.englishDescription,
        type: formulation.type,
        description: formulation.thaiDescription
      });
    }
  };

  // Group formulations by category for display
  const groupedFormulations = useMemo(() => {
    const groups: Record<string, FormulationOption[]> = {};

    filteredFormulations.forEach(formulation => {
      if (!groups[formulation.category]) {
        groups[formulation.category] = [];
      }
      groups[formulation.category].push(formulation);
    });

    return groups;
  }, [filteredFormulations]);

  // Check if mobile
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={className} data-testid="formulation-selector" data-mobile={isMobile}>
      {/* Search Box */}
      <div className="mb-4">
        <FormulationSearchBox
          onSearch={handleSearch}
          onSelect={handleSelect}
          showCategory={!isMobile}
        />
      </div>

      {/* Category Tabs */}
      <div className="mb-4">
        <CategoryTabs
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {/* Content Tabs */}
      <Tabs className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger
            isActive={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            className="text-xs"
          >
            ทั้งหมด
          </TabsTrigger>
          <TabsTrigger
            isActive={activeTab === 'category'}
            onClick={() => setActiveTab('category')}
            className="text-xs"
          >
            หมวดหมู่
          </TabsTrigger>
          {showTemplates && (
            <TabsTrigger
              isActive={activeTab === 'templates'}
              onClick={() => setActiveTab('templates')}
              className="text-xs"
            >
              เทมเพลต
            </TabsTrigger>
          )}
          {showFavorites && (
            <TabsTrigger
              isActive={activeTab === 'favorites'}
              onClick={() => setActiveTab('favorites')}
              className="text-xs"
            >
              รายการโปรด
            </TabsTrigger>
          )}
        </TabsList>

        {/* All Formulations */}
        {activeTab === 'all' && (
          <div className="mt-4">
            <div className={`${maxHeight} overflow-y-auto pr-4`}>
              <div className="grid gap-2">
                {filteredFormulations.map((formulation) => (
                  <FormulationCard
                    key={formulation.type}
                    formulation={formulation}
                    isSelected={selectedType === formulation.type}
                    isFavorite={favorites.includes(formulation.type)}
                    onSelect={() => handleSelect(formulation)}
                    onToggleFavorite={(e) => toggleFavorite(e, formulation)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* By Category */}
        {activeTab === 'category' && (
          <div className="mt-4">
            <div className={`${maxHeight} overflow-y-auto pr-4`}>
              {Object.entries(groupedFormulations).map(([category, formulations]) => (
                <div key={category} className="mb-6">
                  <h3 className="font-semibold text-sm mb-2 text-gray-700">
                    {category === 'Powder' && 'สูตรผง'}
                    {category === 'Liquid' && 'สูตรของเหลว'}
                    {category === 'Special' && 'สูตรพิเศษ'}
                    {category === 'Fertilizer' && 'ปุ๋ย'}
                    {category === 'Adjuvant' && 'สารช่วย'}
                    {category === 'Additional' && 'อื่นๆ'}
                  </h3>
                  <div className="grid gap-2">
                    {formulations.map((formulation) => (
                      <FormulationCard
                        key={formulation.type}
                        formulation={formulation}
                        isSelected={selectedType === formulation.type}
                        isFavorite={favorites.includes(formulation.type)}
                        onSelect={() => handleSelect(formulation)}
                        onToggleFavorite={(e) => toggleFavorite(e, formulation)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Templates */}
        {showTemplates && activeTab === 'templates' && (
          <div className="mt-4">
            <div className={`${maxHeight} overflow-y-auto pr-4`}>
              <div className="grid gap-2">
                {/* {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedType === template.type}
                    onSelect={() => handleSelect({
                      type: template.type,
                      englishDescription: template.name,
                      thaiDescription: template.description || '',
                      category: ''
                    })}
                    frequency={template.frequency}
                  />
                ))} */}
                <div className="text-center py-8 text-gray-500">
                  <p>เทมเพลตจะมาเร็วในเร็วๆ</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Favorites */}
        {showFavorites && activeTab === 'favorites' && (
          <div className="mt-4">
            <div className={`${maxHeight} overflow-y-auto pr-4`}>
              {favorites.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>ยังไม่มีรายการโปรด</p>
                  <p className="text-sm mt-1">กดดาวเพื่อเพิ่มรายการโปรด</p>
                </div>
              ) : (
                <div className="grid gap-2">
                  {filteredFormulations
                    .filter(f => favorites.includes(f.type))
                    .map((formulation) => (
                      <FormulationCard
                        key={formulation.type}
                        formulation={formulation}
                        isSelected={selectedType === formulation.type}
                        isFavorite={true}
                        onSelect={() => handleSelect(formulation)}
                        onToggleFavorite={(e) => toggleFavorite(e, formulation)}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}

// Formulation Card Component
function FormulationCard({
  formulation,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite
}: {
  formulation: FormulationOption;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{formulation.type}</span>
              {isSelected && <Check className="h-4 w-4 text-green-600" />}
            </div>
            <p className="text-sm text-gray-900 mb-1">{formulation.englishDescription}</p>
            <p className="text-xs text-gray-600">{formulation.thaiDescription}</p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Badge variant="outline" className="text-xs">
              {formulation.category}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className="h-6 w-6 p-0"
            >
              <Star className={`h-3 w-3 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Template Card Component
/*
function TemplateCard({
  template,
  isSelected,
  onSelect,
  frequency
}: {
  template: FormulationTemplate;
  isSelected: boolean;
  onSelect: () => void;
  frequency?: number;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-green-500 bg-green-50' : ''
      }`}
      onClick={onSelect}
      data-testid={`template-${template.type}`}
      data-frequency={frequency}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{template.type}</span>
              {isSelected && <Check className="h-4 w-4 text-green-600" />}
              {frequency && frequency > 0.3 && (
                <Badge variant="secondary" className="text-xs">
                  ยอดนิยม
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-900 mb-1">{template.name}</p>
            {template.description && (
              <p className="text-xs text-gray-600">{template.description}</p>
            )}
          </div>
          {frequency && (
            <div className="ml-2">
              <div className="text-xs text-gray-500">
                {Math.round(frequency * 100)}% การใช้งาน
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
*/