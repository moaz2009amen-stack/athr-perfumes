'use client'

import Link from 'next/link'
import { Facebook, Instagram, MessageCircle } from 'lucide-react'
import { FaTiktok } from 'react-icons/fa6'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="font-serif text-2xl text-gold tracking-widest">
              ATHR
            </Link>
            <p className="text-sm text-muted-foreground">
              أثر للعطور الفاخرة - حيث تلتقي الأناقة بالجودة
            </p>
            <div className="flex gap-3">
              <a
                href="https://wa.me/201012345678"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-green-500 hover:text-green-500 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-pink-500 hover:text-pink-500 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-gray-400 hover:text-gray-400 transition-colors"
              >
                <FaTiktok className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-medium mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/products" className="hover:text-gold transition-colors">
                  جميع العطور
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-gold transition-colors">
                  عن أثر
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gold transition-colors">
                  اتصل بنا
                </Link>
              </li>
              <li>
                <button
                  onClick={() => {
                    const modal = document.getElementById('tracking-modal') as HTMLDialogElement
                    modal?.showModal()
                  }}
                  className="hover:text-gold transition-colors"
                >
                  تتبع طلبي
                </button>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-medium mb-4">المساعدة</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/faq" className="hover:text-gold transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-gold transition-colors">
                  سياسة الشحن
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-gold transition-colors">
                  سياسة الإرجاع
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-gold transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium mb-4">تواصل معنا</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <a
                  href="https://wa.me/201012345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  +20 101 234 5678
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:info@athr.com"
                  className="hover:text-gold transition-colors"
                >
                  info@athr.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {currentYear} ATHR. جميع الحقوق محفوظة</p>
          <p className="mt-2">
            Developed by{' '}
            <a
              href="https://wa.me/201550036259"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:underline"
            >
              Moaz
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
