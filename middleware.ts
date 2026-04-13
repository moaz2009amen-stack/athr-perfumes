import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // المسارات العامة (لا تحتاج مصادقة)
  const publicPaths = ['/', '/products', '/about', '/login', '/register']
  const isPublicPath = publicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(`${publicPath}/`)
  )

  // مسارات تحتاج مصادقة
  const authRequiredPaths = ['/profile', '/cart', '/checkout']
  const isAuthRequiredPath = authRequiredPaths.some(
    (authPath) => path === authPath || path.startsWith(`${authPath}/`)
  )

  // مسارات المشرف فقط
  const adminPaths = ['/admin', '/api/admin']
  const isAdminPath = adminPaths.some(
    (adminPath) => path === adminPath || path.startsWith(`${adminPath}/`)
  )

  // إذا كان المسار عاماً، اسمح بالوصول
  if (isPublicPath) {
    // إذا كان المستخدم مسجلاً وحاول دخول /login أو /register، حوله للرئيسية
    if (session && (path === '/login' || path === '/register')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return supabaseResponse
  }

  // إذا لم يكن هناك جلسة والمسار يحتاج مصادقة
  if (!session && (isAuthRequiredPath || isAdminPath)) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // التحقق من صلاحية المشرف للمسارات الإدارية
  if (session && isAdminPath) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    if (!isAdmin) {
      // إذا لم يكن مشرفاً، حوله للصفحة الرئيسية
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
