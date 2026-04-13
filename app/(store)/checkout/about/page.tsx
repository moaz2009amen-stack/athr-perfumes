import { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AboutHero } from '@/components/store/AboutHero'
import { AboutStory } from '@/components/store/AboutStory'
import { AboutValues } from '@/components/store/AboutValues'
import { AboutTeam } from '@/components/store/AboutTeam'

export const metadata: Metadata = {
  title: 'عن أثر | ATHR',
  description: 'تعرف على قصة أثر للعطور الفاخرة ورحلتنا في عالم العطور',
}

export default async function AboutPage() {
  const supabase = await createServerSupabaseClient()
  
  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('visible', true)

  const { count: customerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  return (
    <div className="min-h-screen pt-16">
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutTeam />
      
      {/* Stats Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-gold/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-serif text-gold">
                {productCount || 0}+
              </div>
              <p className="text-muted-foreground tracking-wider">عطر فاخر</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-serif text-gold">
                {customerCount || 0}+
              </div>
              <p className="text-muted-foreground tracking-wider">عميل سعيد</p>
            </div>
            <div className="space-y-2">
              <div className="text-5xl md:text-6xl font-serif text-gold">
                {orderCount || 0}+
              </div>
              <p className="text-muted-foreground tracking-wider">طلب مكتمل</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
