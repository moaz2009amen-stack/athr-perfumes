import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'كود الخصم مطلوب' },
        { status: 400 }
      )
    }

    // Get discount
    const { data: discount, error } = await supabase
      .from('discounts')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !discount) {
      return NextResponse.json(
        { error: 'كود الخصم غير صالح' },
        { status: 404 }
      )
    }

    // Check validity
    const now = new Date()
    const validFrom = new Date(discount.valid_from)
    const validUntil = discount.valid_until ? new Date(discount.valid_until) : null

    if (now < validFrom) {
      return NextResponse.json(
        { error: 'كود الخصم غير فعال بعد' },
        { status: 400 }
      )
    }

    if (validUntil && now > validUntil) {
      return NextResponse.json(
        { error: 'انتهت صلاحية كود الخصم' },
        { status: 400 }
      )
    }

    if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
      return NextResponse.json(
        { error: 'تم استخدام كود الخصم بالكامل' },
        { status: 400 }
      )
    }

    return NextResponse.json({ discount })
  } catch (error) {
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق من كود الخصم' },
      { status: 500 }
    )
  }
}
