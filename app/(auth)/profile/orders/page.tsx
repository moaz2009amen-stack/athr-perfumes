'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Package, Eye, ChevronLeft } from 'lucide-react'
import { formatDate, formatPrice, getStatusLabel, getStatusColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Order } from '@/types'

export default function OrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user) return

      try {
        const response = await fetch('/api/orders')
        const data = await response.json()
        setOrders(data)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [session])

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile" className="text-muted-foreground hover:text-gold">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl font-bold">طلباتي</h1>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">لا توجد طلبات</h3>
              <p className="text-muted-foreground mb-6">لم تقم بأي طلبات بعد</p>
              <Link href="/products">
                <Button className="bg-gold text-background hover:bg-gold-dark">
                  تصفح العطور
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:border-gold/30 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-serif text-gold">
                        {order.order_number}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(order.created_at)}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {Array.isArray(order.items) && order.items.length} منتجات
                      </p>
                      <p className="text-lg font-medium text-gold mt-1">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="border-gold/30 text-gold"
                    >
                      <Eye className="ml-2 h-4 w-4" />
                      التفاصيل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Order Details Dialog */}
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-gold text-xl">
                تفاصيل الطلب {selectedOrder?.order_number}
              </DialogTitle>
              <DialogDescription>
                {selectedOrder && formatDate(selectedOrder.created_at)}
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium">حالة الطلب</span>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusLabel(selectedOrder.status)}
                  </Badge>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-medium mb-2">المنتجات</h4>
                  <div className="space-y-2">
                    {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.product_name} × {item.quantity}</span>
                        <span className="text-gold">{formatPrice(item.product_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>المجموع الفرعي</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-500">
                      <span>الخصم</span>
                      <span>- {formatPrice(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>الإجمالي</span>
                    <span className="text-gold">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t border-border pt-4">
                  <h4 className="font-medium mb-2">معلومات التوصيل</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>الاسم:</strong> {selectedOrder.customer_name}</p>
                    <p><strong>الهاتف:</strong> {selectedOrder.customer_phone}</p>
                    <p><strong>العنوان:</strong> {selectedOrder.customer_address}</p>
                  </div>
                </div>

                {/* Tracking Note */}
                {selectedOrder.tracking_note && (
                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium mb-2">ملاحظة التتبع</h4>
                    <p className="text-sm text-muted-foreground">{selectedOrder.tracking_note}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
