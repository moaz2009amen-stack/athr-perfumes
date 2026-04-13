export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          phone_alternative: string | null
          avatar_url: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
          addresses: Json | null
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          phone_alternative?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
          addresses?: Json | null
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          phone_alternative?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin'
          updated_at?: string
          addresses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          id: number
          name: string
          name_en: string | null
          slug: string
          description: string | null
          price: number
          stock: number
          image: string | null
          images: string[] | null
          badge: string | null
          category: 'men' | 'women' | 'unisex'
          visible: boolean
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          name_en?: string | null
          slug: string
          description?: string | null
          price: number
          stock?: number
          image?: string | null
          images?: string[] | null
          badge?: string | null
          category?: 'men' | 'women' | 'unisex'
          visible?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          name_en?: string | null
          slug?: string
          description?: string | null
          price?: number
          stock?: number
          image?: string | null
          images?: string[] | null
          badge?: string | null
          category?: 'men' | 'women' | 'unisex'
          visible?: boolean
          featured?: boolean
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: number
          order_number: string
          user_id: string | null
          customer_name: string
          customer_email: string | null
          customer_phone: string
          customer_address: string
          location_link: string | null
          items: Json
          subtotal: number
          discount_amount: number
          total: number
          status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_method: string
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_id: string | null
          tracking_note: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          order_number: string
          user_id?: string | null
          customer_name: string
          customer_email?: string | null
          customer_phone: string
          customer_address: string
          location_link?: string | null
          items: Json
          subtotal: number
          discount_amount?: number
          total: number
          status?: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_method: string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_id?: string | null
          tracking_note?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          order_number?: string
          user_id?: string | null
          customer_name?: string
          customer_email?: string | null
          customer_phone?: string
          customer_address?: string
          location_link?: string | null
          items?: Json
          subtotal?: number
          discount_amount?: number
          total?: number
          status?: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_method?: string
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          payment_id?: string | null
          tracking_note?: string | null
          notes?: string | null
          updated_at?: string
        }
      }
      discounts: {
        Row: {
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          code: string
          description?: string | null
          discount_type: 'percentage' | 'fixed'
          discount_value: number
          min_order_amount?: number | null
          max_discount_amount?: number | null
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
          is_active?: boolean
          applies_to?: 'all' | 'products' | 'categories'
          product_ids?: number[] | null
          category_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          code?: string
          description?: string | null
          discount_type?: 'percentage' | 'fixed'
          discount_value?: number
          min_order_amount?: number | null
          max_discount_amount?: number | null
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
          is_active?: boolean
          applies_to?: 'all' | 'products' | 'categories'
          product_ids?: number[] | null
          category_ids?: string[] | null
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: number
          user_id: string
          product_id: number
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          product_id: number
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          product_id?: number
          quantity?: number
          updated_at?: string
        }
      }
      settings: {
        Row: {
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
