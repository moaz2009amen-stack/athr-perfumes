'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface ProductsFiltersProps {
  currentCategory: string
  currentSort: string
  searchValue: string
  totalProducts: number
}

const categories = [
  { value: 'all', label: 'الكل' },
  { value: 'men', label: 'رجالي' },
  { value: 'women', label: 'نسائي' },
  { value: 'unisex', label: 'مشترك' },
]

const sortOptions = [
  { value: 'newest', label: 'الأحدث' },
  { value: 'price-asc', label: 'السعر: من الأقل إلى الأعلى' },
  { value: 'price-desc', label: 'السعر: من الأعلى إلى الأقل' },
  { value: 'name', label: 'الاسم' },
]

export function ProductsFilters({
  currentCategory,
  currentSort,
  searchValue,
  totalProducts,
}: ProductsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchValue)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    params.delete('page')
    router.push(`/products?${params.toString()}`)
  }

  const handleSearch = useDebouncedCallback((value: string) => {
    updateFilters({ search: value })
  }, 300)

  const handleCategoryChange = (category: string) => {
    updateFilters({ category })
    setIsMobileFilterOpen(false)
  }

  const handleSortChange = (sort: string) => {
    updateFilters({ sort })
  }

  const clearFilters = () => {
    router.push('/products')
    setSearch('')
    setIsMobileFilterOpen(false)
  }

  const hasActiveFilters = currentCategory !== 'all' || searchValue

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-medium mb-3">التصنيفات</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => handleCategoryChange(category.value)}
              className={cn(
                'block w-full text-right px-3 py-2 rounded-lg transition-colors',
                currentCategory === category.value
                  ? 'bg-gold/20 text-gold'
                  : 'hover:bg-accent'
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range - Can be added later */}
    </div>
  )

  return (
    <div className="mb-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {totalProducts} منتج
          </p>
          
          {/* Mobile Filter Button */}
          <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="sm:hidden">
                <Filter className="ml-2 h-4 w-4" />
                تصفية
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>تصفية المنتجات</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                handleSearch(e.target.value)
              }}
              placeholder="ابحث عن عطر..."
              className="w-full h-10 pr-10 pl-4 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('')
                  updateFilters({ search: '' })
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>

          {/* Sort */}
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="ترتيب حسب" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">الفلاتر النشطة:</span>
          {currentCategory !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold/10 text-gold text-sm rounded-full">
              {categories.find(c => c.value === currentCategory)?.label}
              <button
                onClick={() => handleCategoryChange('all')}
                className="hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchValue && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gold/10 text-gold text-sm rounded-full">
              بحث: {searchValue}
              <button
                onClick={() => {
                  setSearch('')
                  updateFilters({ search: '' })
                }}
                className="hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            مسح الكل
          </button>
        </div>
      )}

      {/* Desktop Filters Sidebar */}
      <div className="hidden sm:block mt-6">
        <FilterContent />
      </div>
    </div>
  )
}
