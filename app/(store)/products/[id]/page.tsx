import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProductsGrid } from '@/components/store/ProductsGrid'
import { ProductsFilters } from '@/components/store/ProductsFilters'
import { ProductsPagination } from '@/components/store/ProductsPagination'
import { ProductsLoading } from '@/components/store/ProductsLoading'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 3600

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string
    category?: string
    search?: string
    sort?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const category = params.category || 'all'
  const search = params.search || ''
  const sort = params.sort || 'newest'
  const limit = 12

  const supabase = await createServerSupabaseClient()

  // Build query
  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .eq('visible', true)

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,name_en.ilike.%${search}%,description.ilike.%${search}%`)
  }

  // Sorting
  switch (sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true })
      break
    case 'price-desc':
      query = query.order('price', { ascending: false })
      break
    case 'name':
      query = query.order('name', { ascending: true })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: products, count } = await query.range(from, to)

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-gold transition-colors">
            الرئيسية
          </Link>
          <ArrowRight className="h-3 w-3" />
          <span className="text-foreground">العطور</span>
        </nav>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            مجموعة <span className="gold-text">العطور</span>
          </h1>
          <p className="text-muted-foreground tracking-wider">
            اكتشف مجموعتنا الفاخرة من العطور
          </p>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-4" />
        </div>

        {/* Filters */}
        <ProductsFilters 
          currentCategory={category}
          currentSort={sort}
          searchValue={search}
          totalProducts={count || 0}
        />

        {/* Products Grid */}
        <Suspense fallback={<ProductsLoading />}>
          {products && products.length > 0 ? (
            <ProductsGrid products={products} />
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-medium mb-2">لا توجد منتجات</h3>
              <p className="text-muted-foreground">
                لم نتمكن من العثور على عطور تطابق معايير البحث
              </p>
              <Link href="/products" className="mt-6 inline-block">
                <Button variant="outline" className="border-gold text-gold">
                  عرض جميع العطور
                </Button>
              </Link>
            </div>
          )}
        </Suspense>

        {/* Pagination */}
        {totalPages > 1 && (
          <ProductsPagination 
            currentPage={page}
            totalPages={totalPages}
            category={category}
            search={search}
            sort={sort}
          />
        )}
      </div>
    </div>
  )
}
