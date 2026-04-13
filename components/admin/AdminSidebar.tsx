'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  LogOut,
  Store,
  ChevronRight,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const sidebarLinks = [
  {
    title: 'الرئيسية',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'المنتجات',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'الطلبات',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    title: 'العملاء',
    href: '/admin/customers',
    icon: Users,
  },
  {
    title: 'الخصومات',
    href: '/admin/discounts',
    icon: Tag,
  },
  {
    title: 'الإعدادات',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  return (
    <aside className="fixed right-0 top-0 bottom-0 w-64 bg-card border-l border-border hidden lg:block">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/admin/dashboard" className="block">
            <h1 className="font-serif text-2xl text-gold tracking-widest text-center">
              ATHR
            </h1>
            <p className="text-xs text-muted-foreground text-center mt-1 tracking-wider">
              لوحة التحكم
            </p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'admin-sidebar-link group',
                  isActive && 'active'
                )}
              >
                <link.icon className="h-5 w-5" />
                <span className="flex-1">{link.title}</span>
                {isActive && (
                  <ChevronRight className="h-4 w-4 text-gold" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          <Link
            href="/"
            target="_blank"
            className="admin-sidebar-link"
          >
            <Store className="h-5 w-5" />
            <span>عرض المتجر</span>
          </Link>
          
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="ml-2 h-5 w-5" />
            تسجيل الخروج
          </Button>
        </div>
      </div>
    </aside>
  )
}
