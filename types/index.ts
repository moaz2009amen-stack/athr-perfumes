export interface User {
  id: string
  email?: string
  full_name?: string
  phone?: string
  phone_alternative?: string
  avatar_url?: string
  role: 'user' | 'admin'
  addresses?: Address[]
  created_at: string
}

export interface Address {
  id: string
  label: string // مثال: "المنزل"، "العمل"
  street: string
  city: string
  governorate: string
  postal_code?: string
  is_default: boolean
}

export interface Product {
  id: number
  name: string
  name_en: string | null
  slug: string
  description: string | null
  price: number
  stock: number
  image: string | null
  images: string[]
  badge: string | null
  category: 'men' | 'women' | 'unisex'
  visible: boolean
  featured: boolean
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: number
  product_id: number
  product: Product
  quantity: number
}

export interface Order {
  id: number
  order_number: string
  user_id: string | null
  customer_name: string
  customer_email: string | null
  customer_phone: string
  customer_address: string
  location_link: string | null
  items: OrderItem[]
  subtotal: number
  discount_amount: number
  total: number
  status: OrderStatus
  payment_method: string
  payment_status: PaymentStatus
  payment_id: string | null
  tracking_note: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  product_id: number
  product_name: string
  product_price: number
  quantity: number
  product_image?: string
}

export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Discount {
  id: number
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_order_amount: number | null
  max_discount_amount: number | null
  usage_limit: number | null
  used_count: number
  valid_from: string
  valid_until: string | null
  is_active: boolean
  applies_to: 'all' | 'products' | 'categories'
  product_ids: number[] | null
  category_ids: string[] | null
}

export interface DashboardStats {
  total_orders: number
  total_revenue: number
  total_customers: number
  total_products: number
  orders_by_status: Record<OrderStatus, number>
  recent_orders: Order[]
  top_products: { product_id: number; product_name: string; total_sold: number; revenue: number }[]
  revenue_by_day: { date: string; revenue: number }[]
}

// حالة سلة التسوق
export interface CartState {
  items: CartItem[]
  discount: Discount | null
  discountAmount: number
  subtotal: number
  total: number
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  applyDiscount: (discount: Discount) => void
  removeDiscount: () => void
}

// حالة واجهة المستخدم
export interface UIState {
  isCartOpen: boolean
  isMenuOpen: boolean
  isSearchOpen: boolean
  theme: 'dark' | 'light'
  language: 'ar' | 'en'
  openCart: () => void
  closeCart: () => void
  toggleMenu: () => void
  toggleSearch: () => void
  setTheme: (theme: 'dark' | 'light') => void
  setLanguage: (lang: 'ar' | 'en') => void
}
