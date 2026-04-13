'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Trash2, ArrowLeft, Minus, Plus, Tag, X } from 'lucide-react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'

import { useCartStore } from '@/lib/stores/cartStore'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, discount, discountAmount, subtotal, total, updateQuantity, removeItem, applyDiscount, removeDiscount } = useCartStore()
  const [discountCode, setDiscountCode] = useState('')
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error('الرجاء إدخال كود الخصم')
      return
    }

    setIsApplyingDiscount(true)
    
    try {
      const response = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.toUpperCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'كود الخصم غير صالح')
        return
      }

      applyDiscount(data.discount)
      toast.success('تم تطبيق كود الخصم بنجاح')
      setDiscountCode('')
    } catch {
      toast.error('حدث خطأ أثناء تطبيق الخصم')
    } finally {
      setIsApplyingDiscount(false)
    }
  }

  const handleCheckout = () => {
    if (!session) {
      toast.error('يجب تسجيل الدخول لإتمام الطلب')
      router.push('/login?redirect=/checkout')
      return
    }
    router.push('/checkout')
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gold" />
            </div>
            <h1 className="text-2xl font-bold mb-4">السلة فارغة</h1>
            <p className="text-muted-foreground mb-8">
              لم تقم بإضافة أي منتجات إلى سلة التسوق بعد
            </p>
            <Link href="/products">
              <Button className="bg-gold text-background hover:bg-gold-dark">
                تصفح العطور
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">سلة التسوق</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-4 p-4 bg-card border border-border rounded-lg"
                >
                  {/* Product Image */}
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl font-serif text-gold/30">A</span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{item.product.name}</h3>
                        {item.product.name_en && (
                          <p className="text-sm text-gold">{item.product.name_en}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center border border-border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-accent transition-colors"
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-medium text-gold">
                        الإجمالي: {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Link href="/products" className="inline-flex items-center text-gold hover:underline mt-4">
              <ArrowLeft className="ml-2 h-4 w-4" />
              متابعة التسوق
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {discount && (
                  <div className="flex justify-between text-green-500">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      <span>خصم ({discount.code})</span>
                      <button
                        onClick={removeDiscount}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between font-bold text-lg">
                    <span>الإجمالي</span>
                    <span className="text-gold">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {/* Discount Code */}
              {!discount && (
                <div className="mt-6">
                  <label className="text-sm font-medium mb-2 block">كود الخصم</label>
                  <div className="flex gap-2">
                    <Input
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="أدخل الكود"
                      className="uppercase"
                      disabled={isApplyingDiscount}
                    />
                    <Button
                      onClick={handleApplyDiscount}
                      variant="outline"
                      className="border-gold text-gold"
                      disabled={isApplyingDiscount}
                    >
                      تطبيق
                    </Button>
                  </div>
                </div>
              )}

              <Button
                onClick={handleCheckout}
                className="w-full mt-6 bg-gold text-background hover:bg-gold-dark"
              >
                إتمام الشراء
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                الضغط على "إتمام الشراء" يعني موافقتك على{' '}
                <Link href="/terms" className="text-gold hover:underline">
                  الشروط والأحكام
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
