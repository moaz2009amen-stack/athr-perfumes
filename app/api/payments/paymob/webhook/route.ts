import { NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const hmac = request.headers.get('hmac')

    // Verify HMAC signature
    const secret = process.env.PAYMOB_HMAC_SECRET!
    const calculatedHmac = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(body.obj))
      .digest('hex')

    if (hmac !== calculatedHmac) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const supabase = await createAdminSupabaseClient()

    const { obj } = body
    const { order: paymobOrderId, success, amount_cents, currency } = obj

    if (success) {
      // Find order by paymob order id or merchant order id
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .or(`payment_id.eq.${paymobOrderId},order_number.eq.${obj.order.merchant_order_id}`)
        .single()

      if (order) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            payment_id: String(paymobOrderId),
            status: 'processing',
          })
          .eq('id', order.id)
      }
    } else {
      // Payment failed
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .or(`payment_id.eq.${paymobOrderId},order_number.eq.${obj.order.merchant_order_id}`)
        .single()

      if (order) {
        await supabase
          .from('orders')
          .update({
            payment_status: 'failed',
          })
          .eq('id', order.id)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Paymob webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
