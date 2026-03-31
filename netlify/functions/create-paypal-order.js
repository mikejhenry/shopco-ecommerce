/**
 * Netlify Function: create-paypal-order
 * Creates a PayPal order on the server side using PayPal's Orders API v2.
 * Called by the frontend Checkout page before the PayPal popup opens.
 */

const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com'

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

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`PayPal token error: ${err}`)
  }

  const data = await res.json()
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

  const { amount, items } = body

  if (!amount || isNaN(parseFloat(amount))) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid amount' }) }
  }

  try {
    const accessToken = await getAccessToken()

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: parseFloat(amount).toFixed(2),
            breakdown: {
              item_total: {
                currency_code: 'USD',
                value: parseFloat(amount).toFixed(2),
              },
            },
          },
          items: (items ?? []).map((item) => ({
            name: String(item.name).slice(0, 127),
            quantity: String(item.quantity),
            unit_amount: {
              currency_code: 'USD',
              value: parseFloat(item.unit_amount?.value ?? 0).toFixed(2),
            },
          })),
        },
      ],
    }

    const res = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    })

    const data = await res.json()

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: data.message ?? 'PayPal order creation failed' }),
      }
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: data.id }),
    }
  } catch (err) {
    console.error('create-paypal-order error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
