import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ProductDetails } from '@/components/store/ProductDetails'
import { RelatedProducts } from '@/components/store/RelatedProducts'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('visible', true)
    .single()

  if (!product) {
    return {
      title: 'المنتج غير موجود',
      description: 'عذراً، لم نتمكن من العثور على هذا العطر',
    }
  }

  return {
    title: `${product.name} | أثر ATHR`,
    description: product.description || `عطر ${product.name} الفاخر من أثر`,
    openGraph: {
      title: product.name,
      description: product.description || `عطر ${product.name} الفاخر من أثر`,
      images: product.image ? [product.image] : [],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createServerSupabaseClient()
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('visible', true)
    .single()

  if (!product) {
    notFound()
  }

  // Get related products (same category)
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .eq('visible', true)
    .neq('id', product.id)
    .limit(4)

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <ProductDetails product={product} />
        
        {relatedProducts && relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </div>
    </div>
  )
}
