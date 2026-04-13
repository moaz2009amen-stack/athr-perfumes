'use client'

import { useEffect, useState } from 'react'
import { Search, Eye, Truck, CheckCircle, XCircle, Clock, Package, ChevronLeft, ChevronRight } from 'lucide-react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'
import type { Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const statusOptions = [
  { value: 'all', label: 'الكل' },
  { value: 'new', label: 'جديد' },
  { value: 'processing', label: 'قيد التجهيز' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'delivered', label: 'تم التسليم' },
  { value: 'cancelled', label: 'ملغي' },
]

const statusIcons: Record<string, any> = {
  new: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [trackingNote, setTrackingNote] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [page, search, statusFilter])

  const fetchOrders = async () => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      let query = supabase
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 10, page * 10 - 1)

      if (search) {
        query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`)
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, count } = await query

      setOrders(data || [])
      setTotalPages(Math.ceil((count || 0) / 10))
    } catch (error) {
      toast.error('فشل في تحميل الطلبات')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return

    setUpdatingStatus(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: selectedOrder.status,
          tracking_note: trackingNote || selectedOrder.tracking_note,
        })
        .eq('id', selectedOrder.id)

      if (error) throw error

      toast.success('تم تحديث حالة الطلب')
      setSelectedOrder(null)
      setTrackingNote('')
      fetchOrders()
    } catch (error) {
      toast.error('فشل في تحديث حالة الطلب')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleStatusChange = (status: string) => {
    if (selectedOrder) {
      setSelectedOrder({ ...selectedOrder, status: status as Order['status'] })
    }
  }

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setTrackingNote(order.tracking_note || '')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الطلبات</h1>
        <p className="text-muted-foreground mt-1">
          إدارة وتتبع الطلبات
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث برقم الطلب أو اسم العميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">لا توجد طلبات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-right text-sm text-muted-foreground">
                    <th className="p-4">رقم الطلب</th>
                    <th className="p-4">العميل</th>
                    <th className="p-4">الإجمالي</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">الدفع</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const StatusIcon = statusIcons[order.status] || Clock
                    return (
                      <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-4">
                          <span className="font-mono text-gold">{order.order_number}</span>
                        </td>
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
                          </div>
                        </td>
                        <td className="p-4 text-gold">{formatPrice(order.total)}</td>
                        <td className="p-4">
                          <Badge className={getStatusColor(order.status)}>
                            <StatusIcon className="ml-1 h-3 w-3" />
                            {getStatusLabel(order.status)}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                            {order.payment_status === 'paid' ? 'مدفوع' : 'معلق'}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openOrderDetails(order)}
                          >
                            <Eye className="ml-1 h-4 w-4" />
                            تفاصيل
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            صفحة {page} من {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-gold">
              تفاصيل الطلب {selectedOrder?.order_number}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && formatDate(selectedOrder.created_at)}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-medium mb-2">معلومات العميل</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>الاسم:</strong> {selectedOrder.customer_name}</p>
                  <p><strong>الهاتف:</strong> {selectedOrder.customer_phone}</p>
                  {selectedOrder.customer_email && (
                    <p className="col-span-2"><strong>البريد:</strong> {selectedOrder.customer_email}</p>
                  )}
                  <p className="col-span-2"><strong>العنوان:</strong> {selectedOrder.customer_address}</p>
                  {selectedOrder.location_link && (
                    <p className="col-span-2">
                      <a
                        href={selectedOrder.location_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold hover:underline"
                      >
                        📍 عرض الموقع على الخريطة
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-2">المنتجات</h4>
                <div className="space-y-2">
                  {Array.isArray(selectedOrder.items) && selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm border-b border-border pb-2">
                      <span>
                        {item.product_name} × {item.quantity}
                      </span>
                      <span className="text-gold">
                        {formatPrice(item.product_price * item.quantity)}
                      </span>
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

              {/* Status Update */}
              <div className="border-t border-border pt-4">
                <h4 className="font-medium mb-3">تحديث حالة الطلب</h4>
                <div className="space-y-3">
                  <Select value={selectedOrder.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.filter(o => o.value !== 'all').map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div>
                    <Label>ملاحظة التتبع</Label>
                    <Textarea
                      value={trackingNote}
                      onChange={(e) => setTrackingNote(e.target.value)}
                      placeholder="أضف ملاحظة تتبع للعميل..."
                      rows={2}
                    />
                  </div>

                  <Button
                    onClick={handleUpdateStatus}
                    disabled={updatingStatus}
                    className="w-full bg-gold text-background hover:bg-gold-dark"
                  >
                    {updatingStatus ? 'جاري التحديث...' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </div>

              {/* WhatsApp Notification */}
              <Button
                variant="outline"
                className="w-full border-green-500 text-green-500 hover:bg-green-500/10"
                onClick={() => {
                  const message = `مرحباً ${selectedOrder.customer_name} 👋\n\nتحديث طلبك رقم: *${selectedOrder.order_number}*\nالحالة: *${getStatusLabel(selectedOrder.status)}*\n${trackingNote ? `\n📝 ${trackingNote}` : ''}\n\nشكراً لثقتك بنا 🌟`
                  window.open(`https://wa.me/2${selectedOrder.customer_phone}?text=${encodeURIComponent(message)}`, '_blank')
                }}
              >
                📱 إرسال إشعار واتساب
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
