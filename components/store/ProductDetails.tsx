'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Heart, Share2, Truck, Shield, RotateCcw } from 'lucide-react'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/stores/cartStore'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const addItem = useCartStore((state) => state.addItem)

  const images = product.images?.length ? product.images : [product.image].filter(Boolean)

  const handleQuantityChange = (delta: number) => {
    setQuantity(Math.max(1, Math.min(quantity + delta, product.stock)))
  }

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addItem(product, quantity)
      toast.success(`تم إضافة ${quantity} قطعة إلى السلة`)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: product.description || `عطر ${product.name} الفاخر من أثر`,
        url: window.location.href,
      })
    } catch {
      // Fallback
      navigator.clipboard?.writeText(window.location.href)
      toast.success('تم نسخ الرابط')
    }
  }

  const categoryLabels = {
    men: 'رجالي',
    women: 'نسائي',
    unisex: 'مشترك',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Images */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
          {images[selectedImage] ? (
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-serif text-gold/30">ATHR</span>
            </div>
          )}
          
          {product.badge && (
            <span className="absolute top-4 left-4 bg-gold/20 backdrop-blur-sm border border-gold/50 text-gold text-sm px-4 py-1 rounded-full">
              {product.badge}
            </span>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index ? 'border-gold' : 'border-transparent'
                }`}
              >
                <Image
                  src={image}
                  alt={`${product.name} - صورة ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Details */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Title */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.name}</h1>
          {product.name_en && (
            <p className="text-lg text-gold font-serif tracking-wider">{product.name_en}</p>
          )}
        </div>

        {/* Price */}
        <div>
          <span className="text-3xl font-serif text-gold">{formatPrice(product.price)}</span>
        </div>

        {/* Category & Stock */}
        <div className="flex items-center gap-4 text-sm">
          <span className="px-3 py-1 bg-gold/10 text-gold rounded-full">
            {categoryLabels[product.category]}
          </span>
          {product.stock > 0 ? (
            <span className="text-green-500">
              ✓ متوفر ({product.stock} قطعة)
            </span>
          ) : (
            <span className="text-red-500">✗ نفذت الكمية</span>
          )}
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-muted-foreground leading-relaxed">{product.description}</p>
        )}

        {/* Quantity & Add to Cart */}
        {product.stock > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">الكمية:</span>
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-gold text-background hover:bg-gold-dark"
              >
                <ShoppingBag className="ml-2 h-5 w-5" />
                أضف إلى السلة
              </Button>
              <Button variant="outline" size="icon" className="border-gold/30">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare} className="border-gold/30">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            <Truck className="h-5 w-5 text-gold" />
            <div>
              <p className="font-medium">توصيل سريع</p>
              <p className="text-xs text-muted-foreground">خلال 2-5 أيام</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gold" />
            <div>
              <p className="font-medium">منتج أصلي</p>
              <p className="text-xs text-muted-foreground">ضمان 100%</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="h-5 w-5 text-gold" />
            <div>
              <p className="font-medium">إرجاع سهل</p>
              <p className="text-xs text-muted-foreground">خلال 14 يوم</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
