'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit, Trash2, Search, Tag, Percent, DollarSign, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { discountSchema, type DiscountInput } from '@/lib/validations'
import { formatDate } from '@/lib/utils'
import type { Discount } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null)
  const [deleteDiscount, setDeleteDiscount] = useState<Discount | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DiscountInput>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      discount_type: 'percentage',
      applies_to: 'all',
      is_active: true,
    },
  })

  const selectedType = watch('discount_type')
  const selectedActive = watch('is_active')

  useEffect(() => {
    fetchDiscounts()
  }, [page, search])

  const fetchDiscounts = async () => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      let query = supabase
        .from('discounts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 10, page * 10 - 1)

      if (search) {
        query = query.ilike('code', `%${search}%`)
      }

      const { data, count } = await query

      setDiscounts(data || [])
      setTotalPages(Math.ceil((count || 0) / 10))
    } catch (error) {
      toast.error('فشل في تحميل الخصومات')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: DiscountInput) => {
    const supabase = getSupabaseBrowserClient()

    try {
      if (editingDiscount) {
        const { error } = await supabase
          .from('discounts')
          .update(data)
          .eq('id', editingDiscount.id)

        if (error) {
          if (error.code === '23505') {
            toast.error('كود الخصم موجود بالفعل')
            return
          }
          throw error
        }
        toast.success('تم تحديث الخصم بنجاح')
      } else {
        const { error } = await supabase
          .from('discounts')
          .insert({ ...data, used_count: 0 })

        if (error) {
          if (error.code === '23505') {
            toast.error('كود الخصم موجود بالفعل')
            return
          }
          throw error
        }
        toast.success('تم إضافة الخصم بنجاح')
      }

      setIsDialogOpen(false)
      reset()
      setEditingDiscount(null)
      fetchDiscounts()
    } catch (error) {
      toast.error(editingDiscount ? 'فشل في تحديث الخصم' : 'فشل في إضافة الخصم')
    }
  }

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount)
    reset({
      ...discount,
      valid_from: discount.valid_from.split('T')[0],
      valid_until: discount.valid_until?.split('T')[0] || '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteDiscount) return

    const supabase = getSupabaseBrowserClient()

    try {
      const { error } = await supabase
        .from('discounts')
        .delete()
        .eq('id', deleteDiscount.id)

      if (error) throw error

      toast.success('تم حذف الخصم بنجاح')
      setDeleteDiscount(null)
      fetchDiscounts()
    } catch (error) {
      toast.error('فشل في حذف الخصم')
    }
  }

  const checkValidity = (discount: Discount) => {
    const now = new Date()
    const validFrom = new Date(discount.valid_from)
    const validUntil = discount.valid_until ? new Date(discount.valid_until) : null

    if (!discount.is_active) return 'inactive'
    if (now < validFrom) return 'upcoming'
    if (validUntil && now > validUntil) return 'expired'
    if (discount.usage_limit && discount.used_count >= discount.usage_limit) return 'exhausted'
    return 'active'
  }

  const validityBadge = (status: string) => {
    const badges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'نشط', variant: 'default' },
      inactive: { label: 'غير نشط', variant: 'secondary' },
      upcoming: { label: 'قادم', variant: 'outline' },
      expired: { label: 'منتهي', variant: 'destructive' },
      exhausted: { label: 'مكتمل', variant: 'secondary' },
    }
    return badges[status] || badges.inactive
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الخصومات</h1>
          <p className="text-muted-foreground mt-1">
            إدارة أكواد الخصم والعروض
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingDiscount(null)
            reset({
              code: '',
              description: '',
              discount_type: 'percentage',
              discount_value: 0,
              min_order_amount: undefined,
              max_discount_amount: undefined,
              usage_limit: undefined,
              valid_from: new Date().toISOString().split('T')[0],
              valid_until: '',
              is_active: true,
              applies_to: 'all',
            })
            setIsDialogOpen(true)
          }}
          className="bg-gold text-background hover:bg-gold-dark"
        >
          <Plus className="ml-2 h-4 w-4" />
          إضافة خصم
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث عن كود خصم..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : discounts.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">لا توجد خصومات</p>
          </div>
        ) : (
          discounts.map((discount) => {
            const validity = checkValidity(discount)
            const badge = validityBadge(validity)
            
            return (
              <Card key={discount.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="font-mono text-2xl text-gold">
                        {discount.code}
                      </CardTitle>
                      <Badge variant={badge.variant} className="mt-1">
                        {badge.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(discount)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteDiscount(discount)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-lg font-bold">
                    {discount.discount_type === 'percentage' ? (
                      <>
                        <Percent className="h-5 w-5 text-green-500" />
                        <span className="text-green-500">{discount.discount_value}%</span>
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <span className="text-green-500">{discount.discount_value} جنيه</span>
                      </>
                    )}
                  </div>
                  
                  {discount.description && (
                    <p className="text-sm text-muted-foreground">{discount.description}</p>
                  )}
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    {discount.min_order_amount && (
                      <p>الحد الأدنى: {discount.min_order_amount} جنيه</p>
                    )}
                    {discount.max_discount_amount && discount.discount_type === 'percentage' && (
                      <p>أقصى خصم: {discount.max_discount_amount} جنيه</p>
                    )}
                    {discount.usage_limit && (
                      <p>الاستخدام: {discount.used_count} / {discount.usage_limit}</p>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        من {formatDate(discount.valid_from)}
                        {discount.valid_until && ` إلى ${formatDate(discount.valid_until)}`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingDiscount ? 'تعديل الخصم' : 'إضافة خصم جديد'}
            </DialogTitle>
            <DialogDescription>
              أدخل بيانات كود الخصم
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="code">كود الخصم *</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="مثال: WELCOME50"
                className="uppercase"
              />
              {errors.code && (
                <p className="text-sm text-destructive mt-1">{errors.code.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description">الوصف (اختياري)</Label>
              <Textarea id="description" {...register('description')} rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_type">نوع الخصم</Label>
                <Select
                  value={selectedType}
                  onValueChange={(v) => setValue('discount_type', v as 'percentage' | 'fixed')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                    <SelectItem value="fixed">مبلغ ثابت (جنيه)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discount_value">قيمة الخصم *</Label>
                <Input
                  id="discount_value"
                  type="number"
                  {...register('discount_value', { valueAsNumber: true })}
                />
                {errors.discount_value && (
                  <p className="text-sm text-destructive mt-1">{errors.discount_value.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="min_order_amount">الحد الأدنى للطلب</Label>
                <Input
                  id="min_order_amount"
                  type="number"
                  placeholder="اختياري"
                  {...register('min_order_amount', { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="max_discount_amount">
                  {selectedType === 'percentage' ? 'أقصى قيمة خصم' : 'غير متاح'}
                </Label>
                <Input
                  id="max_discount_amount"
                  type="number"
                  placeholder="اختياري"
                  disabled={selectedType !== 'percentage'}
                  {...register('max_discount_amount', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="usage_limit">حد الاستخدام</Label>
              <Input
                id="usage_limit"
                type="number"
                placeholder="اختياري - غير محدود إذا ترك فارغاً"
                {...register('usage_limit', { valueAsNumber: true })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="valid_from">تاريخ البدء *</Label>
                <Input
                  id="valid_from"
                  type="date"
                  {...register('valid_from')}
                />
                {errors.valid_from && (
                  <p className="text-sm text-destructive mt-1">{errors.valid_from.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="valid_until">تاريخ الانتهاء</Label>
                <Input
                  id="valid_until"
                  type="date"
                  placeholder="اختياري"
                  {...register('valid_until')}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="is_active"
                checked={selectedActive}
                onCheckedChange={(v) => setValue('is_active', v)}
              />
              <Label htmlFor="is_active">نشط</Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gold text-background hover:bg-gold-dark"
              >
                {isSubmitting ? 'جاري الحفظ...' : editingDiscount ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDiscount} onOpenChange={() => setDeleteDiscount(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف كود الخصم "{deleteDiscount?.code}"؟ هذا الإجراء لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
