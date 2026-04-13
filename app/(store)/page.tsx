import { Hero } from '@/components/store/Hero'
import { FeaturedProducts } from '@/components/store/FeaturedProducts'
import { AboutSection } from '@/components/store/AboutSection'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export const revalidate = 3600 // Revalidate every hour

export default async function HomePage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('visible', true)
    .order('created_at', { ascending: false })
    .limit(8)

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('visible', true)
    .eq('featured', true)
    .limit(4)

  return (
    <main className="min-h-screen">
      <Hero />
      <FeaturedProducts products={featuredProducts || []} />
      <AboutSection productCount={products?.length || 0} />
    </main>
  )
}
