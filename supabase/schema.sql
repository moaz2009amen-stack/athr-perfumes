-- =====================================================
-- ATHR Perfumes - Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Profiles Table (مرتبط مع auth.users)
-- =====================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    phone TEXT UNIQUE,
    phone_alternative TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    addresses JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Products Table
-- =====================================================
CREATE TABLE public.products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    name_en TEXT,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image TEXT,
    images TEXT[] DEFAULT '{}',
    badge TEXT,
    category TEXT DEFAULT 'unisex' CHECK (category IN ('men', 'women', 'unisex')),
    visible BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Orders Table
-- =====================================================
CREATE TABLE public.orders (
    id BIGSERIAL PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    location_link TEXT,
    items JSONB NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    payment_id TEXT,
    tracking_note TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Cart Items Table
-- =====================================================
CREATE TABLE public.cart_items (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- =====================================================
-- Discounts Table
-- =====================================================
CREATE TABLE public.discounts (
    id BIGSERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    min_order_amount DECIMAL(10, 2) CHECK (min_order_amount >= 0),
    max_discount_amount DECIMAL(10, 2) CHECK (max_discount_amount >= 0),
    usage_limit INTEGER CHECK (usage_limit > 0),
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    applies_to TEXT DEFAULT 'all' CHECK (applies_to IN ('all', 'products', 'categories')),
    product_ids BIGINT[] DEFAULT '{}',
    category_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Settings Table
-- =====================================================
CREATE TABLE public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- Indexes for Performance
-- =====================================================
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_visible ON public.products(visible);
CREATE INDEX idx_products_featured ON public.products(featured);
CREATE INDEX idx_products_slug ON public.products(slug);

CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX idx_cart_items_user_id ON public.cart_items(user_id);

CREATE INDEX idx_discounts_code ON public.discounts(code);
CREATE INDEX idx_discounts_is_active ON public.discounts(is_active);

-- =====================================================
-- Updated At Trigger Function
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at
    BEFORE UPDATE ON public.discounts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON public.settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- Auto-create profile on user signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Row Level Security (RLS) Policies
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Profiles Policies
-- =====================================================
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- Products Policies
-- =====================================================
-- Anyone can view visible products
CREATE POLICY "Anyone can view visible products"
    ON public.products FOR SELECT
    USING (visible = true);

-- Admins can view all products
CREATE POLICY "Admins can view all products"
    ON public.products FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Admins can insert products
CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Admins can update products
CREATE POLICY "Admins can update products"
    ON public.products FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Admins can delete products
CREATE POLICY "Admins can delete products"
    ON public.products FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- Orders Policies
-- =====================================================
-- Users can view their own orders
CREATE POLICY "Users can view own orders"
    ON public.orders FOR SELECT
    USING (user_id = auth.uid());

-- Users can insert orders (for themselves or guest)
CREATE POLICY "Anyone can insert orders"
    ON public.orders FOR INSERT
    WITH CHECK (true);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
    ON public.orders FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Admins can update orders
CREATE POLICY "Admins can update orders"
    ON public.orders FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- Cart Items Policies
-- =====================================================
-- Users can view their own cart
CREATE POLICY "Users can view own cart"
    ON public.cart_items FOR SELECT
    USING (user_id = auth.uid());

-- Users can insert into their own cart
CREATE POLICY "Users can insert into own cart"
    ON public.cart_items FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Users can update their own cart
CREATE POLICY "Users can update own cart"
    ON public.cart_items FOR UPDATE
    USING (user_id = auth.uid());

-- Users can delete from their own cart
CREATE POLICY "Users can delete from own cart"
    ON public.cart_items FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- Discounts Policies
-- =====================================================
-- Anyone can view active discounts
CREATE POLICY "Anyone can view active discounts"
    ON public.discounts FOR SELECT
    USING (is_active = true);

-- Admins can view all discounts
CREATE POLICY "Admins can view all discounts"
    ON public.discounts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- Admins can manage discounts
CREATE POLICY "Admins can insert discounts"
    ON public.discounts FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can update discounts"
    ON public.discounts FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can delete discounts"
    ON public.discounts FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- Settings Policies
-- =====================================================
-- Anyone can view settings
CREATE POLICY "Anyone can view settings"
    ON public.settings FOR SELECT
    USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can insert settings"
    ON public.settings FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Admins can update settings"
    ON public.settings FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ));

-- =====================================================
-- Insert Default Settings
-- =====================================================
INSERT INTO public.settings (key, value) VALUES
    ('whatsapp', '"201012345678"'),
    ('store_name', '{"ar": "أثر", "en": "ATHR"}'),
    ('store_description', '{"ar": "متجر عطور فاخرة", "en": "Luxury Perfume Store"}'),
    ('shipping_fees', '{"cairo": 50, "giza": 50, "alexandria": 60, "default": 100}')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- Create first admin user (run after creating first user)
-- =====================================================
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'admin@athr.com';
