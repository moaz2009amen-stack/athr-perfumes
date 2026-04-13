import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, language: 'ar' | 'en' = 'ar'): string {
  const formatter = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  return formatter.format(price)
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `ATHR-${timestamp}-${random}`
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0621-\u063A\u0641-\u064A]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getStatusLabel(status: string, language: 'ar' | 'en' = 'ar'): string {
  const labels: Record<string, { ar: string; en: string }> = {
    new: { ar: 'جديد', en: 'New' },
    processing: { ar: 'قيد التجهيز', en: 'Processing' },
    shipped: { ar: 'تم الشحن', en: 'Shipped' },
    delivered: { ar: 'تم التسليم', en: 'Delivered' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' },
    pending: { ar: 'قيد الانتظار', en: 'Pending' },
    paid: { ar: 'مدفوع', en: 'Paid' },
    failed: { ar: 'فشل', en: 'Failed' },
    refunded: { ar: 'مسترجع', en: 'Refunded' },
  }
  return labels[status]?.[language] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
    processing: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
    shipped: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    delivered: 'bg-green-500/10 text-green-500 border-green-500/30',
    cancelled: 'bg-red-500/10 text-red-500 border-red-500/30',
    pending: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
    paid: 'bg-green-500/10 text-green-500 border-green-500/30',
    failed: 'bg-red-500/10 text-red-500 border-red-500/30',
  }
  return colors[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/30'
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function formatDate(date: string | Date, language: 'ar' | 'en' = 'ar'): string {
  const d = new Date(date)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  return d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options)
}

export function formatDateTime(date: string | Date, language: 'ar' | 'en' = 'ar'): string {
  const d = new Date(date)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options)
}

export function validatePhone(phone: string): boolean {
  const egyptianPhoneRegex = /^(01[0-2,5]{1}[0-9]{8})$/
  return egyptianPhoneRegex.test(phone.replace(/\D/g, ''))
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function calculateShipping(governorate: string): number {
  const shippingRates: Record<string, number> = {
    'القاهرة': 50,
    'الجيزة': 50,
    'الإسكندرية': 60,
    'البحيرة': 60,
    'كفر الشيخ': 60,
    'الغربية': 60,
    'المنوفية': 60,
    'الشرقية': 60,
    'الدقهلية': 60,
    'دمياط': 60,
    'بورسعيد': 60,
    'الإسماعيلية': 60,
    'السويس': 60,
    'القليوبية': 50,
    'الفيوم': 70,
    'بني سويف': 70,
    'المنيا': 80,
    'أسيوط': 90,
    'سوهاج': 100,
    'قنا': 110,
    'الأقصر': 120,
    'أسوان': 130,
    'البحر الأحمر': 120,
    'الوادي الجديد': 130,
    'مطروح': 120,
    'شمال سيناء': 120,
    'جنوب سيناء': 120,
  }
  return shippingRates[governorate] || 100
}
