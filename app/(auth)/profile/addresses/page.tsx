'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit, Trash2, MapPin, Home, Briefcase, Heart, ChevronLeft, Check } from 'lucide-react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { addressSchema, type AddressInput } from '@/lib/validations'
import type { Address } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { toast } from 'sonner'

const egyptGovernorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'البحيرة', 'كفر الشيخ', 'الغربية',
  'المنوفية', 'الشرقية', 'الدقهلية', 'دمياط', 'بورسعيد', 'الإسماعيلية',
  'السويس', 'القليوبية', 'الفيوم', 'بني سويف', 'المنيا', 'أسيوط',
  'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد',
  'مطروح', 'شمال سيناء', 'جنوب سيناء',
]

const addressIcons = {
  home: <Home className="h-5 w-5" />,
  work: <Briefcase className="h-5 w-5" />,
  other: <Heart className="h-5 w-5" />,
}

const addressLabels = {
  home: 'المنزل',
  work: 'العمل',
  other: 'آخر',
}

export default function AddressesPage() {
  const { data: session } = useSession()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: 'home',
      is_default: false,
    },
  })

  const selectedLabel = watch('label')
  const selectedGovernorate = watch('governorate')

  useEffect(() => {
    fetchAddresses()
  }, [session])

  const fetchAddresses = async () => {
    if (!session?.user) return

    try {
      const supabase = getSupabaseBrowserClient()
      const { data, error } = await supabase
        .from('profiles')
        .select('addresses')
        .eq('id', session.user.id)
        .single()

      if (error) throw error

      setAddresses(data?.addresses || [])
    } catch (error) {
      toast.error('فشل في تحميل العناوين')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: AddressInput) => {
    if (!session?.user) return

    try {
      const supabase = getSupabaseBrowserClient()
      let newAddresses: Address[]

      const newAddress: Address = {
        id: editingAddress?.id || Date.now().toString(),
        ...data,
      }

      if (editingAddress) {
        newAddresses = addresses.map((a) => (a.id === editingAddress.id ? newAddress : a))
      } else {
        newAddresses = [...addresses, newAddress]
      }

      // If this address is default, unset others
      if (data.is_default) {
        newAddresses = newAddresses.map((a) => ({
          ...a,
          is_default: a.id === newAddress.id,
        }))
      }

      const { error } = await supabase
        .from('profiles')
        .update({ addresses: newAddresses })
        .eq('id', session.user.id)

      if (error) throw error

      setAddresses(newAddresses)
      toast.success(editingAddress ? 'تم تحديث العنوان' : 'تم إضافة العنوان')
      setIsDialogOpen(false)
      reset()
      setEditingAddress(null)
    } catch (error) {
      toast.error('فشل في حفظ العنوان')
    }
  }

  const handleDelete = async (id: string) => {
    if (!session?.user) return

    try {
      const supabase = getSupabaseBrowserClient()
      const newAddresses = addresses.filter((a) => a.id !== id)

      const { error } = await supabase
        .from('profiles')
        .update({ addresses: newAddresses })
        .eq('id', session.user.id)

      if (error) throw error

      setAddresses(newAddresses)
      toast.success('تم حذف العنوان')
    } catch (error) {
      toast.error('فشل في حذف العنوان')
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    reset(address)
    setIsDialogOpen(true)
  }

  const handleSetDefault = async (id: string) => {
    if (!session?.user) return

    try {
      const supabase = getSupabaseBrowserClient()
      const newAddresses = addresses.map((a) => ({
        ...a,
        is_default: a.id === id,
      }))

      const { error } = await supabase
        .from('profiles')
        .update({ addresses: newAddresses })
        .eq('id', session.user.id)

      if (error) throw error

      setAddresses(newAddresses)
      toast.success('تم تعيين العنوان الافتراضي')
    } catch (error) {
      toast.error('فشل في تعيين العنوان الافتراضي')
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/profile" className="text-muted-foreground hover:text-gold">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold">عناويني</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingAddress(null)
                  reset({
                    label: 'home',
                    street: '',
                    city: '',
                    governorate: '',
                    postal_code: '',
                    is_default: addresses.length === 0,
                  })
                }}
                className="bg-gold text-background hover:bg-gold-dark"
              >
                <Plus className="ml-2 h-4 w-4" />
                إضافة عنوان
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
                </DialogTitle>
                <DialogDescription>
                  أدخل تفاصيل العنوان للتوصيل
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label>نوع العنوان</Label>
                  <RadioGroup
                    value={selectedLabel}
                    onValueChange={(v) => setValue('label', v as 'home' | 'work' | 'other')}
                    className="flex gap-4 mt-2"
                  >
                    {Object.entries(addressLabels).map(([value, label]) => (
                      <div key={value} className="flex items-center space-x-2 space-x-reverse">
                        <RadioGroupItem value={value} id={value} />
                        <Label htmlFor={value} className="flex items-center gap-1 cursor-pointer">
                          {addressIcons[value as keyof typeof addressIcons]}
                          {label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="street">العنوان التفصيلي *</Label>
                  <Input
                    id="street"
                    placeholder="الشارع، رقم المبنى، رقم الشقة"
                    {...register('street')}
                    className={errors.street ? 'border-destructive' : ''}
                  />
                  {errors.street && (
                    <p className="text-sm text-destructive mt-1">{errors.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">المدينة *</Label>
                    <Input
                      id="city"
                      placeholder="مثال: مدينة نصر"
                      {...register('city')}
                      className={errors.city ? 'border-destructive' : ''}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="postal_code">الرمز البريدي</Label>
                    <Input
                      id="postal_code"
                      placeholder="اختياري"
                      {...register('postal_code')}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="governorate">المحافظة *</Label>
                  <Select
                    value={selectedGovernorate}
                    onValueChange={(v) => setValue('governorate', v)}
                  >
                    <SelectTrigger className={errors.governorate ? 'border-destructive' : ''}>
                      <SelectValue placeholder="اختر المحافظة" />
                    </SelectTrigger>
                    <SelectContent>
                      {egyptGovernorates.map((gov) => (
                        <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.governorate && (
                    <p className="text-sm text-destructive mt-1">{errors.governorate.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <input
                    type="checkbox"
                    id="is_default"
                    {...register('is_default')}
                    className="w-4 h-4 accent-gold"
                  />
                  <Label htmlFor="is_default">تعيين كعنوان افتراضي</Label>
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
                    {isSubmitting ? 'جاري الحفظ...' : editingAddress ? 'تحديث' : 'حفظ'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : addresses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">لا توجد عناوين</h3>
              <p className="text-muted-foreground mb-6">
                لم تقم بإضافة أي عناوين توصيل بعد
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gold text-background hover:bg-gold-dark"
              >
                <Plus className="ml-2 h-4 w-4" />
                إضافة عنوان جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <Card key={address.id} className={address.is_default ? 'border-gold' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {addressIcons[address.label as keyof typeof addressIcons] || addressIcons.other}
                      <div>
                        <CardTitle className="text-lg">
                          {addressLabels[address.label as keyof typeof addressLabels] || address.label}
                          {address.is_default && (
                            <span className="mr-2 text-xs bg-gold/20 text-gold px-2 py-1 rounded-full">
                              افتراضي
                            </span>
                          )}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!address.is_default && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          className="text-muted-foreground hover:text-gold"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(address)}
                        className="text-muted-foreground hover:text-gold"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(address.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{address.street}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {address.city}، {address.governorate}
                    {address.postal_code && ` - ${address.postal_code}`}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
