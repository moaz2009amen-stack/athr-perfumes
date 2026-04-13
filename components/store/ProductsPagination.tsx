'use client'

import Link from 'next/link'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProductsPaginationProps {
  currentPage: number
  totalPages: number
  category: string
  search: string
  sort: string
}

export function ProductsPagination({
  currentPage,
  totalPages,
  category,
  search,
  sort,
}: ProductsPaginationProps) {
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams()
    if (category && category !== 'all') params.set('category', category)
    if (search) params.set('search', search)
    if (sort && sort !== 'newest') params.set('sort', sort)
    if (page > 1) params.set('page', page.toString())
    
    const queryString = params.toString()
    return `/products${queryString ? `?${queryString}` : ''}`
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    pages.push(1)

    if (currentPage > 3) {
      pages.push('...')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('...')
    }

    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-center gap-2 mt-12">
      {/* Previous */}
      <Link
        href={createPageUrl(currentPage - 1)}
        className={cn(
          'w-10 h-10 flex items-center justify-center rounded-lg border border-border transition-colors',
          currentPage === 1
            ? 'opacity-50 pointer-events-none'
            : 'hover:border-gold hover:text-gold'
        )}
        aria-disabled={currentPage === 1}
      >
        <ChevronRight className="h-5 w-5" />
      </Link>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="w-10 text-center text-muted-foreground">
            ...
          </span>
        ) : (
          <Link
            key={page}
            href={createPageUrl(page as number)}
            className={cn(
              'w-10 h-10 flex items-center justify-center rounded-lg border transition-colors',
              currentPage === page
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-border hover:border-gold hover:text-gold'
            )}
          >
            {page}
          </Link>
        )
      ))}

      {/* Next */}
      <Link
        href={createPageUrl(currentPage + 1)}
        className={cn(
          'w-10 h-10 flex items-center justify-center rounded-lg border border-border transition-colors',
          currentPage === totalPages
            ? 'opacity-50 pointer-events-none'
            : 'hover:border-gold hover:text-gold'
        )}
        aria-disabled={currentPage === totalPages}
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>
    </nav>
  )
}
