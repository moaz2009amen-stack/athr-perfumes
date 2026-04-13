import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

export const registerSchema = z.object({
  full_name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().regex(/^(01[0-2,5]{1}[0-9]{8})$/, 'رقم الهاتف غير صالح (مثال: 01xxxxxxxxx)'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirm_password'],
})

export const profileUpdateSchema = z.object({
  full_name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل').optional(),
  phone: z.string().regex(/^(01[0-2,5]{1}[0-9]{8})$/, 'رقم الهاتف غير صالح').optional(),
  phone_alternative: z.string().regex(/^(01[0-2,5]{1}[0-9]{8})$/, 'رقم الهاتف غير صالح').optional().or(z.literal('')),
})

export const addressSchema = z.object({
  label: z.string().min(1, 'اسم العنوان مطلوب'),
  street: z.string().min(5, 'العنوان التفصيلي مطلوب'),
  city: z.string().min(2, 'المدينة مطلوبة'),
  governorate: z.string().min(2, 'المحافظة مطلوبة'),
  postal_code: z.string().optional(),
  is_default: z.boolean().default(false),
})

export const orderSchema = z.object({
  customer_name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  customer_email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  customer_phone: z.string().regex(/^(01[0-2,5]{1}[0-9]{8})$/, 'رقم الهاتف غير صالح'),
  customer_address: z.string().min(10, 'العنوان التفصيلي مطلوب'),
  notes: z.string().optional(),
})

export const productSchema = z.object({
  name: z.string().min(2, 'اسم العطر مطلوب'),
  name_en: z.string().optional(),
  description: z.string().optional(),
  price: z.number().min(0, 'السعر يجب أن يكون أكبر من 0'),
  stock: z.number().min(0, 'الكمية يجب أن تكون 0 أو أكثر'),
  image: z.string().url('رابط الصورة غير صالح').optional().or(z.literal('')),
  badge: z.string().optional(),
  category: z.enum(['men', 'women', 'unisex']),
  visible: z.boolean().default(true),
  featured: z.boolean().default(false),
})

export const discountSchema = z.object({
  code: z.string().min(3, 'كود الخصم يجب أن يكون 3 أحرف على الأقل').toUpperCase(),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number().min(1, 'قيمة الخصم يجب أن تكون أكبر من 0'),
  min_order_amount: z.number().min(0).optional(),
  max_discount_amount: z.number().min(0).optional(),
  usage_limit: z.number().min(1).optional(),
  valid_from: z.string(),
  valid_until: z.string().optional(),
  is_active: z.boolean().default(true),
  applies_to: z.enum(['all', 'products', 'categories']).default('all'),
  product_ids: z.array(z.number()).optional(),
  category_ids: z.array(z.string()).optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type AddressInput = z.infer<typeof addressSchema>
export type OrderInput = z.infer<typeof orderSchema>
export type ProductInput = z.infer<typeof productSchema>
export type DiscountInput = z.infer<typeof discountSchema>
