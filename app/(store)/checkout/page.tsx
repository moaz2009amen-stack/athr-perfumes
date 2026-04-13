'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin, Phone, User, Mail, Truck, CreditCard, Shield } from 'lucide-react'
import Image from 'next/image'

import { useCartStore } from '@/lib/stores/cartStore'
import { formatPrice, validatePhone, validateEmail } from '@/lib/utils'
import { orderSchema, type OrderInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { items, discount, discountAmount, subtotal, total, clearCart } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod')
  const [locationLink, setLocationLink] = useState<string | null>(null)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OrderInput>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer_name: session?.user?.full_name || '',
      customer_email: session?.user?.email || '',
      customer_phone: session?.user?.phone || '',
    },
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/checkout')
    }
  }, [status, router])

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  const getLocation = () => {
    setIsGettingLocation(true)
    
    if (!navigator.geolocation) {
      toast.error('المتصفح لا يدعم تحديد الموقع')
      setIsGettingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const link = `https://maps.google.com/?q=${latitude},${longitude}`
        setLocationLink(link)
        toast.success('تم تحديد موقعك بنجاح')
        setIsGettingLocation(false)
      },
      () => {
        toast.error('لم نتمكن من تحديد موقعك')
        setIsGettingLocation(false)
      }
    )
  }

  const onSubmit = async (data: OrderInput) => {
    setIsLoading(true)

    try {
      // Create order items
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        product_name: item.product.name,
        product_price: item.product.price,
        quantity: item.quantity,
        product_image: item.product.image,
      }))

      const orderData = {
        ...data,
        items: orderItems,
        subtotal,
        discount_amount: discountAmount,
        total,
        payment_method: paymentMethod,
        location_link: locationLink,
        discount_code: discount?.code || null,
      }

      // If payment by card, redirect to payment gateway
      if (paymentMethod === 'card') {
        const response = await fetch('/api/payments/paymob/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            orderId: `TEMP-${Date.now()}`,
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            customerPhone: data.customer_phone,
            orderData,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'فشل في بدء عملية الدفع')
        }

        // Store order data in session for after payment
        sessionStorage.setItem('pendingOrder', JSON.stringify(orderData))
        
        // Redirect to Paymob iframe
        window.location.href = result.iframeUrl
        return
      }

      // Cash on delivery - create order directly
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'فشل في إنشاء الطلب')
      }

      // Clear cart and redirect to success
      clearCart()
      router.push(`/checkout/success?order=${result.order_number}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'حدث خطأ غير متوقع')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || items.length === 0) {
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

  return (
    <div className="min-h-screen pt-24 pb-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">إتمام الشراء</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Information */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-gold" />
                  معلومات العميل
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">الاسم الكامل *</Label>
                    <Input
                      id="customer_name"
                      {...register('customer_name')}
                      placeholder="محمد أحمد"
                      className={errors.customer_name ? 'border-destructive' : ''}
                    />
                    {errors.customer_name && (
                      <p className="text-sm text-destructive mt-1">{errors.customer_name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="customer_phone">رقم الهاتف *</Label>
                    <Input
                      id="customer_phone"
                      {...register('customer_phone')}
                      placeholder="01xxxxxxxxx"
                      className={errors.customer_phone ? 'border-destructive' : ''}
                    />
                    {errors.customer_phone && (
                      <p className="text-sm text-destructive mt-1">{errors.customer_phone.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="customer_email">البريد الإلكتروني (اختياري)</Label>
                    <Input
                      id="customer_email"
                      type="email"
                      {...register('customer_email')}
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gold" />
                  عنوان التوصيل
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="customer_address">العنوان التفصيلي *</Label>
                    <Textarea
                      id="customer_address"
                      {...register('customer_address')}
                      placeholder="المدينة، المنطقة، الشارع، رقم المبنى، رقم الشقة"
                      rows={3}
                      className={errors.customer_address ? 'border-destructive' : ''}
                    />
                    {errors.customer_address && (
                      <p className="text-sm text-destructive mt-1">{errors.customer_address.message}</p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={getLocation}
                    disabled={isGettingLocation}
                    className="border-gold/30 text-gold"
                  >
                    <MapPin className="ml-2 h-4 w-4" />
                    {isGettingLocation ? 'جاري تحديد الموقع...' : 'مشاركة موقعي الحالي'}
                  </Button>
                  
                  {locationLink && (
                    <p className="text-sm text-green-500">
                      ✓ تم تحديد موقعك
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gold" />
                  طريقة الدفع
                </h2>
                
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cod' | 'card')}>
                  <div className="flex items-center space-x-2 space-x-reverse p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-gold" />
                        <div>
                          <p className="font-medium">الدفع عند الاستلام</p>
                          <p className="text-sm text-muted-foreground">ادفع نقداً عند استلام طلبك</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse p-4 border border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-gold" />
                        <div>
                          <p className="font-medium">الدفع بالبطاقة</p>
                          <p className="text-sm text-muted-foreground">ادفع بأمان باستخدام بطاقتك</p>
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Notes */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">ملاحظات إضافية (اختياري)</h2>
                <Textarea
                  {...register('notes')}
                  placeholder="أي ملاحظات إضافية بخصوص طلبك..."
                  rows={2}
                />
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>
              
              {/* Items */}
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-xl font-serif text-gold/30">A</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">الكمية: {item.quantity}</p>
                      <p className="text-sm text-gold">{formatPrice(item.product.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 text-sm border-t border-border pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">المجموع الفرعي</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                
                {discount && (
                  <div className="flex justify-between text-green-500">
                    <span>خصم ({discount.code})</span>
                    <span>- {formatPrice(discountAmount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الشحن</span>
                  <span>يحدد لاحقاً</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
                  <span>الإجمالي</span>
                  <span className="text-gold">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isLoading}
                className="w-full mt-6 bg-gold text-background hover:bg-gold-dark"
              >
                {isLoading ? 'جاري المعالجة...' : paymentMethod === 'card' ? 'الانتقال للدفع' : 'تأكيد الطلب'}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                بالضغط على تأكيد الطلب، أنت توافق على{' '}
                <a href="/terms" className="text-gold hover:underline">الشروط والأحكام</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
