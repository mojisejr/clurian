"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import {
  getFormulationSuggestions,
  debounce,
  type FormulationOption
} from '@/lib/chemical-formulation-search';

interface FormulationSearchBoxProps {
  onSearch: (query: string) => void;
  onSelect: (formulation: FormulationOption) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
  showCategory?: boolean;
}

export function FormulationSearchBox({
  onSearch,
  onSelect,
  placeholder = 'ค้นหาประเภทสารเคมี...',
  className,
  debounceMs = 300,
  showCategory = true
}: FormulationSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<FormulationOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle query change with debounced search
  useEffect(() => {
    onSearch(query);

    // Debounced search for suggestions
    const debouncedSearch = debounce((searchQuery: string) => {
      if (searchQuery.trim()) {
        const results = getFormulationSuggestions(searchQuery, 8);
        setSuggestions([...results]);
      } else {
        setSuggestions([]);
      }
    }, debounceMs);

    debouncedSearch(query);
    setShowSuggestions(query.trim().length > 0);
  }, [query, onSearch, debounceMs]);

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle suggestion selection
  const handleSelectSuggestion = (formulation: FormulationOption) => {
    setQuery(formulation.type);
    setShowSuggestions(false);
    onSelect(formulation);
    inputRef.current?.blur();
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`} data-testid="search-box">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(query.trim().length > 0)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
          data-testid="search-input"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            data-testid="clear-search"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          data-testid="suggestions"
        >
          {suggestions.map((formulation) => (
            <button
              key={formulation.type}
              type="button"
              onClick={() => handleSelectSuggestion(formulation)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50"
              data-testid={`suggestion-${formulation.type}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{formulation.type}</span>
                  <span className="text-sm text-gray-900">{formulation.englishDescription}</span>
                </div>
                {showCategory && (
                  <Badge variant="outline" className="text-xs">
                    {formulation.category}
                  </Badge>
                )}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {formulation.thaiDescription}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && query.trim().length > 0 && suggestions.length === 0 && (
        <div
          className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-sm text-gray-500"
          data-testid="no-results"
        >
          ไม่พบประเภทสารเคมีที่ค้นหา
        </div>
      )}
    </div>
  );
}