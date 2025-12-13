"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from "@/lib/utils"
import { Tabs, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface SlidableTabItem {
  id: string
  label: string
  badge?: string | number
}

interface SlidableTabsProps {
  tabs: SlidableTabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  className?: string
  children?: React.ReactNode
}

export function SlidableTabs({
  tabs,
  activeTab,
  onTabChange,
  className,
  children
}: SlidableTabsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  // Check scroll position for indicators
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    setCanScrollLeft(container.scrollLeft > 0)
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth
    )
  }, [])

  // Scroll to active tab
  const scrollToActiveTab = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const activeTabElement = container.querySelector(`[data-tab-id="${activeTab}"]`)
    if (activeTabElement) {
      const tabLeft = (activeTabElement as HTMLElement).offsetLeft
      const tabWidth = (activeTabElement as HTMLElement).offsetWidth
      const containerWidth = container.clientWidth
      const scrollPosition = tabLeft - (containerWidth - tabWidth) / 2

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    }
  }, [activeTab])

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    checkScrollPosition()
    scrollToActiveTab()

    container.addEventListener('scroll', checkScrollPosition)
    return () => container.removeEventListener('scroll', checkScrollPosition)
  }, [activeTab, tabs, checkScrollPosition, scrollToActiveTab])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 200
    const newScrollPosition = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount

    container.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab)

    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      onTabChange(tabs[currentIndex - 1].id)
    } else if (e.key === 'ArrowRight' && currentIndex < tabs.length - 1) {
      onTabChange(tabs[currentIndex + 1].id)
    }
  }

  if (tabs.length === 0) {
    return null
  }

  return (
    <Tabs className={cn("w-full", className)}>
      {/* Scrollable Tabs Container */}
      <div className="relative">
        {/* Left scroll indicator */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />
        )}

        {/* Right scroll indicator */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />
        )}

        {/* Scroll buttons (desktop) */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1 bg-white border rounded-r-md shadow-sm disabled:opacity-0 disabled:invisible md:block hidden"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 bg-white border rounded-l-md shadow-sm disabled:opacity-0 disabled:invisible md:block hidden"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Tabs List with Horizontal Scrolling */}
        <div
          ref={scrollContainerRef}
          role="tablist"
          className="flex overflow-x-auto scrollbar-hide scroll-smooth"
          onKeyDown={handleKeyDown}
        >
          <div className="flex items-center h-9 border-b border-border">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                isActive={activeTab === tab.id}
                onClick={() => onTabChange(tab.id)}
                data-tab-id={tab.id}
                className="flex-shrink-0 px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300 whitespace-nowrap"
              >
                {tab.label}
                {tab.badge && (
                  <Badge variant="secondary" className="ml-2 text-xs px-1.5 py-0">
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {children && (
        <TabsContent className="mt-4">
          {tabs.find(tab => tab.id === activeTab) && children}
        </TabsContent>
      )}
    </Tabs>
  )
}

export default SlidableTabs