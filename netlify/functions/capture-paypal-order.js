/**
 * Netlify Function: capture-paypal-order
 * Captures an approved PayPal payment and writes the order to Supabase.
 * Uses the Supabase SERVICE ROLE KEY (never exposed to the browser).
 */

import { createClient } from '@supabase/supabase-js'

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`PayPal token error: ${JSON.stringify(data)}`)
  return data.access_token
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) }
  }

  const { paypalOrderId, customerId, shippingAddress, items, total } = body

  if (!paypalOrderId || !customerId || !items?.length || !total) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) }
  }

  try {
    // 1. Capture the PayPal payment
    const accessToken = await getAccessToken()

    const captureRes = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const captureData = await captureRes.json()

    if (!captureRes.ok) {
      console.error('PayPal capture failed:', captureData)
      return {
        statusCode: 400,
        body: JSON.stringify({ error: captureData.message ?? 'PayPal capture failed' }),
      }
    }

    const captureId =
      captureData.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? null

    // 2. Decrement product stock
    for (const item of items) {
      const { data: product, error: fetchErr } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.product_id)
        .single()

      if (!fetchErr && product) {
        const newQty = Math.max(0, product.quantity - item.quantity)
        await supabase
          .from('products')
          .update({ quantity: newQty, updated_at: new Date().toISOString() })
          .eq('id', item.product_id)
      }
    }

    // 3. Create the order record
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'paid',
        total: parseFloat(total),
        paypal_order_id: paypalOrderId,
        paypal_capture_id: captureId,
        shipping_address: shippingAddress ?? null,
      })
      .select()
      .single()

    if (orderErr) {
      console.error('Supabase order insert error:', orderErr)
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to save order' }) }
    }

    // 4. Create order_items records
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: parseFloat(item.price_at_purchase),
      product_title: item.product_title,
    }))

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)

    if (itemsErr) {
      console.error('Supabase order_items insert error:', itemsErr)
      // Order was created — don't fail the whole request, just log it
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, captureId }),
    }
  } catch (err) {
    console.error('capture-paypal-order error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
