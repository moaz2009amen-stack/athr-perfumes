'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Phone, Mail, MapPin, Save, Camera } from 'lucide-react'

import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { profileUpdateSchema, type ProfileUpdateInput } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    resolver: zodResolver(profileUpdateSchema),
  })

  useEffect(() => {
    if (session?.user) {
      setValue('full_name', session.user.full_name || '')
      setValue('phone', session.user.phone || '')
    }
  }, [session, setValue])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: ProfileUpdateInput) => {
    setIsLoading(true)
    const supabase = getSupabaseBrowserClient()

    try {
      let avatarUrl = session?.user?.avatar_url

      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${session?.user?.id}-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        avatarUrl = publicUrl
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          phone: data.phone,
          phone_alternative: data.phone_alternative,
          avatar_url: avatarUrl,
        })
        .eq('id', session?.user?.id)

      if (error) throw error

      // Update session
      await update({
        ...session,
        user: {
          ...session?.user,
          full_name: data.full_name,
          phone: data.phone,
          avatar_url: avatarUrl,
        },
      })

      toast.success('تم تحديث الملف الشخصي بنجاح')
      router.refresh()
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث الملف الشخصي')
    } finally {
      setIsLoading(false)
    }
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
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">الملف الشخصي</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="profile">الملف الشخصي</TabsTrigger>
            <TabsTrigger value="addresses">العناوين</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>معلومات الحساب</CardTitle>
                <CardDescription>تحديث معلوماتك الشخصية</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={avatarPreview || session?.user?.avatar_url || ''} />
                        <AvatarFallback className="bg-gold/20 text-gold text-xl">
                          {session?.user?.full_name ? getInitials(session.user.full_name) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 p-1 bg-gold text-background rounded-full cursor-pointer hover:bg-gold-dark transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                    <div>
                      <p className="font-medium">{session?.user?.full_name || 'مستخدم'}</p>
                      <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="full_name">الاسم الكامل</Label>
                      <div className="relative">
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="full_name"
                          className="pr-10"
                          {...register('full_name')}
                        />
                      </div>
                      {errors.full_name && (
                        <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <div className="relative">
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          className="pr-10"
                          value={session?.user?.email || ''}
                          disabled
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          className="pr-10"
                          placeholder="01xxxxxxxxx"
                          {...register('phone')}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone_alternative">رقم هاتف بديل (اختياري)</Label>
                      <div className="relative">
                        <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone_alternative"
                          className="pr-10"
                          placeholder="01xxxxxxxxx"
                          {...register('phone_alternative')}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gold text-background hover:bg-gold-dark"
                  >
                    <Save className="ml-2 h-4 w-4" />
                    {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <CardTitle>العناوين المحفوظة</CardTitle>
                <CardDescription>إدارة عناوين التوصيل الخاصة بك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد عناوين محفوظة بعد</p>
                  <Button variant="outline" className="mt-4 border-gold text-gold">
                    إضافة عنوان جديد
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>تغيير كلمة المرور</CardTitle>
                <CardDescription>تحديث كلمة المرور الخاصة بحسابك</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="current_password">كلمة المرور الحالية</Label>
                    <Input id="current_password" type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
                    <Input id="new_password" type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <Label htmlFor="confirm_password">تأكيد كلمة المرور</Label>
                    <Input id="confirm_password" type="password" placeholder="••••••••" />
                  </div>
                  <Button className="bg-gold text-background hover:bg-gold-dark">
                    تغيير كلمة المرور
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
