'use client'

import { useEffect, useState } from 'react'
import { Search, User, Mail, Phone, Calendar, Package, DollarSign, ChevronLeft, ChevronRight, Eye } from 'lucide-react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { formatPrice, formatDate } from '@/lib/utils'
import type { User as UserType } from '@/types'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'

interface CustomerWithStats extends UserType {
  order_count: number
  total_spent: number
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null)
  const [customerOrders, setCustomerOrders] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCustomers()
  }, [page, search, roleFilter])

  const fetchCustomers = async () => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('limit', '10')
      if (search) params.set('search', search)
      if (roleFilter !== 'all') params.set('role', roleFilter)

      const response = await fetch(`/api/admin/customers?${params.toString()}`)
      const data = await response.json()

      setCustomers(data.customers)
      setTotalPages(data.totalPages)
    } catch (error) {
      toast.error('فشل في تحميل العملاء')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomerOrders = async (customerId: string) => {
    const supabase = getSupabaseBrowserClient()

    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', customerId)
        .order('created_at', { ascending: false })

      setCustomerOrders(data || [])
    } catch (error) {
      toast.error('فشل في تحميل طلبات العميل')
    }
  }

  const handleViewCustomer = (customer: CustomerWithStats) => {
    setSelectedCustomer(customer)
    fetchCustomerOrders(customer.id)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">العملاء</h1>
        <p className="text-muted-foreground mt-1">
          إدارة حسابات العملاء
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث باسم العميل أو البريد أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="النوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="user">مستخدم</SelectItem>
            <SelectItem value="admin">مشرف</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-16">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">لا يوجد عملاء</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-right text-sm text-muted-foreground">
                    <th className="p-4">العميل</th>
                    <th className="p-4">معلومات التواصل</th>
                    <th className="p-4">الطلبات</th>
                    <th className="p-4">إجمالي المشتريات</th>
                    <th className="p-4">تاريخ التسجيل</th>
                    <th className="p-4">النوع</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-gold/20 text-gold">
                              {getInitials(customer.full_name || 'User')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{customer.full_name || 'بدون اسم'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.email || '-'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{customer.phone || '-'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.order_count} طلب</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-gold">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatPrice(customer.total_spent)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(customer.created_at)}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={customer.role === 'admin' ? 'default' : 'secondary'}>
                          {customer.role === 'admin' ? 'مشرف' : 'مستخدم'}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewCustomer(customer)}
                        >
                          <Eye className="ml-1 h-4 w-4" />
                          تفاصيل
                        </Button>
                      </td>
                    </tr>
                  ))}
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

      {/* Customer Details Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تفاصيل العميل</DialogTitle>
            <DialogDescription>
              معلومات الحساب وسجل الطلبات
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-gold/20 text-gold text-xl">
                    {getInitials(selectedCustomer.full_name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{selectedCustomer.full_name || 'بدون اسم'}</h3>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                    <p><strong>البريد:</strong> {selectedCustomer.email || '-'}</p>
                    <p><strong>الهاتف:</strong> {selectedCustomer.phone || '-'}</p>
                    <p><strong>هاتف بديل:</strong> {selectedCustomer.phone_alternative || '-'}</p>
                    <p><strong>تاريخ التسجيل:</strong> {formatDate(selectedCustomer.created_at)}</p>
                  </div>
                  <Badge className="mt-2" variant={selectedCustomer.role === 'admin' ? 'default' : 'secondary'}>
                    {selectedCustomer.role === 'admin' ? 'مشرف' : 'مستخدم'}
                  </Badge>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gold" />
                    <div className="text-2xl font-bold">{selectedCustomer.order_count}</div>
                    <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-gold" />
                    <div className="text-2xl font-bold text-gold">
                      {formatPrice(selectedCustomer.total_spent)}
                    </div>
                    <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <Calendar className="h-8 w-8 mx-auto mb-2 text-gold" />
                    <div className="text-2xl font-bold">
                      {customerOrders.filter(o => o.status === 'delivered').length}
                    </div>
                    <p className="text-sm text-muted-foreground">طلبات مكتملة</p>
                  </CardContent>
                </Card>
              </div>

              {/* Orders History */}
              <div>
                <h4 className="font-medium mb-3">سجل الطلبات</h4>
                {customerOrders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">لا توجد طلبات لهذا العميل</p>
                ) : (
                  <div className="space-y-2">
                    {customerOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-mono text-gold">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(order.total)}</p>
                          <Badge variant="outline">{order.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
