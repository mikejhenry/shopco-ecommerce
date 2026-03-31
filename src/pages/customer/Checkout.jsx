import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js'
import { useCartStore } from '../../store/cartStore'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Spinner from '../../components/ui/Spinner'
import { ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)
  const clearCart = useCartStore((s) => s.clearCart)
  const [{ isPending }] = usePayPalScriptReducer()

  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })
  const [errors, setErrors] = useState({})

  function setField(field, value) {
    setAddress((a) => ({ ...a, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const errs = {}
    if (!address.line1.trim()) errs.line1 = 'Street address is required'
    if (!address.city.trim()) errs.city = 'City is required'
    if (!address.state.trim()) errs.state = 'State is required'
    if (!address.zip.trim()) errs.zip = 'ZIP code is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  if (items.length === 0) {
    return (
      <div className="container-app py-16 text-center">
        <p className="text-slate-500 mb-4">Your cart is empty.</p>
        <Link to="/shop" className="btn-primary px-6 py-2.5">Shop Now</Link>
      </div>
    )
  }

  const total = getTotal()

  async function createPayPalOrder() {
    if (!validate()) {
      throw new Error('Please fill in all required shipping fields before paying.')
    }

    const res = await fetch('/.netlify/functions/create-paypal-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: total.toFixed(2),
        items: items.map((i) => ({
          name: i.title,
          quantity: String(i.qty),
          unit_amount: { currency_code: 'USD', value: i.price.toFixed(2) },
        })),
      }),
    })

    if (!res.ok) throw new Error('Failed to create PayPal order')
    const data = await res.json()
    return data.id
  }

  async function onApprove(data) {
    try {
      const res = await fetch('/.netlify/functions/capture-paypal-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paypalOrderId: data.orderID,
          customerId: user.id,
          shippingAddress: address,
          items: items.map((i) => ({
            product_id: i.id,
            quantity: i.qty,
            price_at_purchase: i.price,
            product_title: i.title,
          })),
          total: total.toFixed(2),
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Payment capture failed')
      }

      const result = await res.json()
      clearCart()
      navigate(`/order-confirmation/${result.orderId}`)
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="container-app py-8 md:py-12">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Shipping form */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-slate-900 mb-5">Shipping Address</h2>
            <div className="space-y-4">
              <Input
                label="Street Address"
                value={address.line1}
                onChange={(e) => setField('line1', e.target.value)}
                error={errors.line1}
                placeholder="123 Main St"
                required
              />
              <Input
                label="Apt, Suite, etc. (optional)"
                value={address.line2}
                onChange={(e) => setField('line2', e.target.value)}
                placeholder="Apt 4B"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={address.city}
                  onChange={(e) => setField('city', e.target.value)}
                  error={errors.city}
                  required
                />
                <Input
                  label="State"
                  value={address.state}
                  onChange={(e) => setField('state', e.target.value)}
                  error={errors.state}
                  placeholder="e.g. CA"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP Code"
                  value={address.zip}
                  onChange={(e) => setField('zip', e.target.value)}
                  error={errors.zip}
                  required
                />
                <Input label="Country" value={address.country} readOnly />
              </div>
            </div>
          </div>

          {/* PayPal */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={18} className="text-green-600" />
              <h2 className="font-semibold text-slate-900">Payment</h2>
              <span className="text-xs text-slate-400 ml-auto">Secured by PayPal</span>
            </div>

            {isPending ? (
              <div className="flex justify-center py-6">
                <Spinner size="lg" />
              </div>
            ) : (
              <PayPalButtons
                style={{ layout: 'vertical', shape: 'rect', color: 'gold' }}
                createOrder={createPayPalOrder}
                onApprove={onApprove}
                onError={(err) => toast.error('PayPal error: ' + err.message)}
                onCancel={() => toast('Payment cancelled')}
              />
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="card p-5 sticky top-24">
            <h2 className="font-semibold text-slate-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 truncate">{item.title}</p>
                    <p className="text-slate-400 text-xs">Qty: {item.qty}</p>
                  </div>
                  <span className="font-semibold text-slate-800 flex-shrink-0">
                    ${(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="text-green-600">Calculated by seller</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-base pt-1 border-t border-gray-100">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
