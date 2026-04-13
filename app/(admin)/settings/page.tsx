'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Key, Phone, Globe, Shield } from 'lucide-react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

const settingsSchema = z.object({
  whatsapp: z.string().regex(/^[0-9]+$/, 'رقم غير صالح'),
  store_name_ar: z.string().min(1, 'اسم المتجر مطلوب'),
  store_name_en: z.string().min(1, 'Store name required'),
  store_email: z.string().email('بريد إلكتروني غير صالح'),
  store_phone: z.string().regex(/^[0-9]+$/, 'رقم غير صالح'),
  shipping_cairo: z.string().regex(/^[0-9]+$/, 'قيمة غير صالحة'),
  shipping_alex: z.string().regex(/^[0-9]+$/, 'قيمة غير صالحة'),
  shipping_other: z.string().regex(/^[0-9]+$/, 'قيمة غير صالحة'),
})

type SettingsInput = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    const supabase = getSupabaseBrowserClient()
    
    const { data } = await supabase
      .from('settings')
      .select('*')

    if (data) {
      const settings: Record<string, any> = {}
      data.forEach((s) => {
        settings[s.key] = s.value
      })

      setValue('whatsapp', settings.whatsapp || '')
      setValue('store_name_ar', settings.store_name?.ar || 'أثر')
      setValue('store_name_en', settings.store_name?.en || 'ATHR')
      setValue('store_email', settings.store_email || '')
      setValue('store_phone', settings.store_phone || '')
      
      const shipping = settings.shipping_fees || {}
      setValue('shipping_cairo', String(shipping.cairo || '50'))
      setValue('shipping_alex', String(shipping.alexandria || '60'))
      setValue('shipping_other', String(shipping.default || '100'))
    }
  }

  const onSubmit = async (data: SettingsInput) => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const settings = [
        { key: 'whatsapp', value: data.whatsapp },
        { 
          key: 'store_name', 
          value: { ar: data.store_name_ar, en: data.store_name_en }
        },
        { key: 'store_email', value: data.store_email },
        { key: 'store_phone', value: data.store_phone },
        {
          key: 'shipping_fees',
          value: {
            cairo: parseInt(data.shipping_cairo),
            giza: parseInt(data.shipping_cairo),
            alexandria: parseInt(data.shipping_alex),
            default: parseInt(data.shipping_other),
          },
        },
      ]

      for (const setting of settings) {
        await supabase
          .from('settings')
          .upsert(setting, { onConflict: 'key' })
      }

      toast.success('تم حفظ الإعدادات بنجاح')
    } catch (error) {
      toast.error('فشل في حفظ الإعدادات')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      toast.error('كلمتا المرور غير متطابقتين')
      return
    }

    if (passwordData.new.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setIsChangingPassword(true)
    const supabase = getSupabaseBrowserClient()

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new,
      })

      if (error) throw error

      toast.success('تم تغيير كلمة المرور بنجاح')
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (error) {
      toast.error('فشل في تغيير كلمة المرور')
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-muted-foreground mt-1">
          إدارة إعدادات المتجر والحساب
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">عام</TabsTrigger>
          <TabsTrigger value="shipping">الشحن</TabsTrigger>
          <TabsTrigger value="security">الأمان</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gold" />
                الإعدادات العامة
              </CardTitle>
              <CardDescription>
                تعديل معلومات المتجر الأساسية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="store_name_ar">اسم المتجر (عربي)</Label>
                    <Input
                      id="store_name_ar"
                      {...register('store_name_ar')}
                      className={errors.store_name_ar ? 'border-destructive' : ''}
                    />
                    {errors.store_name_ar && (
                      <p className="text-sm text-destructive mt-1">{errors.store_name_ar.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="store_name_en">اسم المتجر (إنجليزي)</Label>
                    <Input
                      id="store_name_en"
                      {...register('store_name_en')}
                      className={errors.store_name_en ? 'border-destructive' : ''}
                    />
                    {errors.store_name_en && (
                      <p className="text-sm text-destructive mt-1">{errors.store_name_en.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="store_email">البريد الإلكتروني</Label>
                    <Input
                      id="store_email"
                      type="email"
                      {...register('store_email')}
                      className={errors.store_email ? 'border-destructive' : ''}
                    />
                    {errors.store_email && (
                      <p className="text-sm text-destructive mt-1">{errors.store_email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="store_phone">رقم الهاتف</Label>
                    <Input
                      id="store_phone"
                      {...register('store_phone')}
                      className={errors.store_phone ? 'border-destructive' : ''}
                    />
                    {errors.store_phone && (
                      <p className="text-sm text-destructive mt-1">{errors.store_phone.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    رقم الواتساب للطلبات
                  </Label>
                  <div className="flex">
                    <span className="px-3 py-2 bg-muted border border-border border-r-0 rounded-r-md text-muted-foreground">
                      +20
                    </span>
                    <Input
                      id="whatsapp"
                      className="rounded-r-none"
                      placeholder="1012345678"
                      {...register('whatsapp')}
                    />
                  </div>
                  {errors.whatsapp && (
                    <p className="text-sm text-destructive mt-1">{errors.whatsapp.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gold text-background hover:bg-gold-dark"
                >
                  <Save className="ml-2 h-4 w-4" />
                  {isLoading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الشحن</CardTitle>
              <CardDescription>
                تحديد رسوم الشحن حسب المحافظة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="shipping_cairo">القاهرة والجيزة (جنيه)</Label>
                  <Input
                    id="shipping_cairo"
                    type="number"
                    {...register('shipping_cairo')}
                  />
                </div>

                <div>
                  <Label htmlFor="shipping_alex">الإسكندرية والدلتا (جنيه)</Label>
                  <Input
                    id="shipping_alex"
                    type="number"
                    {...register('shipping_alex')}
                  />
                </div>

                <div>
                  <Label htmlFor="shipping_other">المحافظات الأخرى (جنيه)</Label>
                  <Input
                    id="shipping_other"
                    type="number"
                    {...register('shipping_other')}
                  />
                </div>

                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isLoading}
                  className="bg-gold text-background hover:bg-gold-dark"
                >
                  <Save className="ml-2 h-4 w-4" />
                  حفظ إعدادات الشحن
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gold" />
                تغيير كلمة المرور
              </CardTitle>
              <CardDescription>
                تحديث كلمة المرور الخاصة بحساب المشرف
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="current_password">كلمة المرور الحالية</Label>
                  <div className="relative">
                    <Key className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="current_password"
                      type="password"
                      className="pr-10"
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="confirm_password">تأكيد كلمة المرور</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                  />
                </div>

                <Button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="bg-gold text-background hover:bg-gold-dark"
                >
                  {isChangingPassword ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
