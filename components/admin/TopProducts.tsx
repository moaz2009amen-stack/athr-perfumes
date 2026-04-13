'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Package, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'

interface TopProduct {
  product_id: number
  product_name: string
  product_image: string | null
  total_sold: number
  revenue: number
}

export function TopProducts() {
  const [products, setProducts] = useState<TopProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTopProducts()
  }, [])

  const fetchTopProducts = async () => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const { data: orders } = await supabase
        .from('orders')
        .select('items')
        .eq('payment_status', 'paid')

      if (!orders) {
        setProducts([])
        return
      }

      // Aggregate product sales
      const productStats: Record<number, TopProduct> = {}

      orders.forEach((order) => {
        const items = order.items as any[]
        if (Array.isArray(items)) {
          items.forEach((item) => {
            if (!productStats[item.product_id]) {
              productStats[item.product_id] = {
                product_id: item.product_id,
                product_name: item.product_name,
                product_image: item.product_image || null,
                total_sold: 0,
                revenue: 0,
              }
            }
            productStats[item.product_id].total_sold += item.quantity
            productStats[item.product_id].revenue += item.product_price * item.quantity
          })
        }
      })

      // Sort by revenue and take top 5
      const topProducts = Object.values(productStats)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      setProducts(topProducts)
    } catch (error) {
      console.error('Failed to fetch top products:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-gold" />
          الأكثر مبيعاً
        </CardTitle>
        <CardDescription>أفضل 5 منتجات من حيث المبيعات</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">لا توجد مبيعات بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <div key={product.product_id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-sm">
                  #{index + 1}
                </div>
                <div className="relative w-10 h-10 rounded overflow-hidden bg-muted flex-shrink-0">
                  {product.product_image ? (
                    <Image
                      src={product.product_image}
                      alt={product.product_name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{product.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.total_sold} قطعة مباعة
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gold">{formatPrice(product.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
