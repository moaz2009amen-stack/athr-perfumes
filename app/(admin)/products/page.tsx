'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit, Trash2, Eye, EyeOff, Search, Package, ChevronLeft, ChevronRight } from 'lucide-react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { productSchema, type ProductInput } from '@/lib/validations'
import { generateSlug, formatPrice } from '@/lib/utils'
import type { Product } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      visible: true,
      featured: false,
      category: 'unisex',
      stock: 0,
      price: 0,
    },
  })

  const selectedCategory = watch('category')
  const selectedVisible = watch('visible')
  const selectedFeatured = watch('featured')
  const imageUrl = watch('image')

  useEffect(() => {
    fetchProducts()
  }, [page, search, categoryFilter])

  const fetchProducts = async () => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * 10, page * 10 - 1)

      if (search) {
        query = query.or(`name.ilike.%${search}%,name_en.ilike.%${search}%`)
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter)
      }

      const { data, count } = await query

      setProducts(data || [])
      setTotalPages(Math.ceil((count || 0) / 10))
    } catch (error) {
      toast.error('فشل في تحميل المنتجات')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ProductInput) => {
    const supabase = getSupabaseBrowserClient()

    try {
      const slug = generateSlug(data.name)

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({ ...data, slug })
          .eq('id', editingProduct.id)

        if (error) throw error
        toast.success('تم تحديث المنتج بنجاح')
      } else {
        const { error } = await supabase
          .from('products')
          .insert({ ...data, slug })

        if (error) throw error
        toast.success('تم إضافة المنتج بنجاح')
      }

      setIsDialogOpen(false)
      reset()
      setEditingProduct(null)
      fetchProducts()
    } catch (error) {
      toast.error(editingProduct ? 'فشل في تحديث المنتج' : 'فشل في إضافة المنتج')
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    reset(product)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteProduct) return

    const supabase = getSupabaseBrowserClient()

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteProduct.id)

      if (error) throw error

      toast.success('تم حذف المنتج بنجاح')
      setDeleteProduct(null)
      fetchProducts()
    } catch (error) {
      toast.error('فشل في حذف المنتج')
    }
  }

  const handleToggleVisibility = async (product: Product) => {
    const supabase = getSupabaseBrowserClient()

    try {
      const { error } = await supabase
        .from('products')
        .update({ visible: !product.visible })
        .eq('id', product.id)

      if (error) throw error

      toast.success(product.visible ? 'تم إخفاء المنتج' : 'تم إظهار المنتج')
      fetchProducts()
    } catch (error) {
      toast.error('فشل في تحديث المنتج')
    }
  }

  const categoryLabels: Record<string, string> = {
    men: 'رجالي',
    women: 'نسائي',
    unisex: 'مشترك',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المنتجات</h1>
          <p className="text-muted-foreground mt-1">
            إدارة المنتجات والمخزون
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingProduct(null)
            reset({
              name: '',
              name_en: '',
              description: '',
              price: 0,
              stock: 0,
              image: '',
              badge: '',
              category: 'unisex',
              visible: true,
              featured: false,
            })
            setIsDialogOpen(true)
          }}
          className="bg-gold text-background hover:bg-gold-dark"
        >
          <Plus className="ml-2 h-4 w-4" />
          إضافة منتج
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="التصنيف" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="men">رجالي</SelectItem>
            <SelectItem value="women">نسائي</SelectItem>
            <SelectItem value="unisex">مشترك</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">لا توجد منتجات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr className="text-right text-sm text-muted-foreground">
                    <th className="p-4">الصورة</th>
                    <th className="p-4">الاسم</th>
                    <th className="p-4">السعر</th>
                    <th className="p-4">المخزون</th>
                    <th className="p-4">التصنيف</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-4">
                        {product.image ? (
                          <Image
                            src={product.image}
                            alt={product.name}
                            width={50}
                            height={50}
                            className="rounded object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.name_en && (
                            <p className="text-xs text-gold">{product.name_en}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gold">{formatPrice(product.price)}</td>
                      <td className="p-4">
                        <Badge variant={product.stock > 10 ? 'default' : product.stock > 0 ? 'secondary' : 'destructive'}>
                          {product.stock} قطعة
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{categoryLabels[product.category]}</Badge>
                      </td>
                      <td className="p-4">
                        {product.visible ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                            ظاهر
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/30">
                            مخفي
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleVisibility(product)}
                          >
                            {product.visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteProduct(product)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
            <DialogDescription>
              أدخل بيانات المنتج
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم العطر (عربي) *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="name_en">اسم العطر (إنجليزي)</Label>
                <Input id="name_en" {...register('name_en')} />
              </div>

              <div>
                <Label htmlFor="price">السعر (جنيه) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="stock">الكمية *</Label>
                <Input
                  id="stock"
                  type="number"
                  {...register('stock', { valueAsNumber: true })}
                  className={errors.stock ? 'border-destructive' : ''}
                />
                {errors.stock && (
                  <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">التصنيف</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(v) => setValue('category', v as 'men' | 'women' | 'unisex')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unisex">مشترك</SelectItem>
                    <SelectItem value="men">رجالي</SelectItem>
                    <SelectItem value="women">نسائي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="badge">شارة (اختياري)</Label>
                <Input id="badge" {...register('badge')} placeholder="مثال: جديد" />
              </div>
            </div>

            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea id="description" {...register('description')} rows={3} />
            </div>

            <div>
              <Label htmlFor="image">رابط الصورة</Label>
              <Input id="image" {...register('image')} placeholder="https://..." />
              {imageUrl && (
                <div className="mt-2">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="rounded object-cover"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="visible"
                  checked={selectedVisible}
                  onCheckedChange={(v) => setValue('visible', v)}
                />
                <Label htmlFor="visible">ظاهر في المتجر</Label>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="featured"
                  checked={selectedFeatured}
                  onCheckedChange={(v) => setValue('featured', v)}
                />
                <Label htmlFor="featured">منتج مميز</Label>
              </div>
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
                {isSubmitting ? 'جاري الحفظ...' : editingProduct ? 'تحديث' : 'إضافة'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف "{deleteProduct?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.
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
