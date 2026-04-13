'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'

import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/stores/cartStore'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (product.stock > 0) {
      addItem(product, 1)
      toast.success('تم إضافة العطر إلى السلة')
    }
  }

  const categoryLabels = {
    men: 'رجالي',
    women: 'نسائي',
    unisex: 'مشترك',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="group block bg-card border border-border rounded-lg overflow-hidden card-hover"
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-4xl font-serif text-gold/30">ATHR</span>
            </div>
          )}
          
          {/* Badges */}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-gold/20 backdrop-blur-sm border border-gold/50 text-gold text-xs px-3 py-1 rounded-full">
              {product.badge}
            </span>
          )}
          
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <span className="text-muted-foreground text-lg font-medium px-4 py-2 border border-muted-foreground rounded">
                نفذت الكمية
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-2">
            <h3 className="text-xl font-bold mb-1 group-hover:text-gold transition-colors">
              {product.name}
            </h3>
            {product.name_en && (
              <p className="text-sm text-gold font-serif tracking-wider">
                {product.name_en}
              </p>
            )}
          </div>

          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {product.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-serif text-gold">
                {formatPrice(product.price)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {product.category !== 'unisex' && categoryLabels[product.category]}
            </div>
          </div>

          {/* Stock Status */}
          <div className="mt-3">
            {product.stock > 5 ? (
              <span className="text-xs text-green-500">✓ متوفر</span>
            ) : product.stock > 0 ? (
              <span className="text-xs text-yellow-500">⚠ متبقي {product.stock} قطعة</span>
            ) : (
              <span className="text-xs text-red-500">✗ نفذت الكمية</span>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="w-full mt-4 bg-transparent border border-gold text-gold hover:bg-gold hover:text-background"
          >
            <ShoppingBag className="ml-2 h-4 w-4" />
            أضف إلى السلة
          </Button>
        </div>
      </Link>
    </motion.div>
  )
}
