import { NextRequest, NextResponse } from 'next/server'

const PAYMOB_API_KEY = process.env.PAYMOB_API_KEY!
const PAYMOB_INTEGRATION_ID = process.env.PAYMOB_INTEGRATION_ID!
const PAYMOB_BASE_URL = 'https://accept.paymob.com/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, orderId, customerName, customerEmail, customerPhone } = body

    // Step 1: Authentication
    const authResponse = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: PAYMOB_API_KEY }),
    })

    const authData = await authResponse.json()
    const authToken = authData.token

    // Step 2: Order Registration
    const orderResponse = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: Math.round(amount * 100),
        currency: 'EGP',
        merchant_order_id: orderId,
        items: [],
      }),
    })

    const orderData = await orderResponse.json()

    // Step 3: Payment Key Generation
    const paymentKeyResponse = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: Math.round(amount * 100),
        expiration: 3600,
        order_id: orderData.id,
        billing_data: {
          apartment: 'NA',
          email: customerEmail || 'customer@athr.com',
          floor: 'NA',
          first_name: customerName.split(' ')[0] || 'Customer',
          last_name: customerName.split(' ').slice(1).join(' ') || 'Name',
          street: 'NA',
          building: 'NA',
          phone_number: customerPhone,
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'NA',
          country: 'EG',
          state: 'NA',
        },
        currency: 'EGP',
        integration_id: parseInt(PAYMOB_INTEGRATION_ID),
        lock_order_when_paid: false,
      }),
    })

    const paymentKeyData = await paymentKeyResponse.json()

    // Step 4: Return iframe URL
    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKeyData.token}`

    return NextResponse.json({
      success: true,
      iframeUrl,
      paymentToken: paymentKeyData.token,
      orderId: orderData.id,
    })
  } catch (error) {
    console.error('Paymob initiation error:', error)
    return NextResponse.json(
      { error: 'Payment initiation failed' },
      { status: 500 }
    )
  }
}
