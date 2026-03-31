import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'
import Spinner from '../../components/ui/Spinner'
import { format } from 'date-fns'

export default function OrderConfirmation() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single()

      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id)

      setOrder(orderData)
      setItems(itemsData ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  }

  if (!order) {
    return (
      <div className="container-app py-16 text-center">
        <p className="text-slate-500">Order not found.</p>
        <Link to="/" className="btn-primary mt-4 px-6 py-2.5 inline-flex">Go Home</Link>
      </div>
    )
  }

  return (
    <div className="container-app py-12 max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
        <p className="text-slate-500">
          Thank you for your purchase. We'll get it shipped to you soon.
        </p>
      </div>

      <div className="card p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Order ID</p>
            <p className="font-mono font-medium text-slate-800">{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Date</p>
            <p className="font-medium text-slate-800">{format(new Date(order.created_at), 'MMM d, yyyy')}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Status</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Total</p>
            <p className="font-bold text-slate-900 text-lg">${Number(order.total).toFixed(2)}</p>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Items Ordered</h3>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-slate-600">{item.product_title} ×{item.quantity}</span>
                <span className="font-medium text-slate-800">
                  ${(item.price_at_purchase * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping */}
        {order.shipping_address && (
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Shipping To</h3>
            <p className="text-sm text-slate-600">
              {order.shipping_address.line1}
              {order.shipping_address.line2 && `, ${order.shipping_address.line2}`}<br />
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}<br />
              {order.shipping_address.country}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link to="/my-orders" className="btn-primary flex-1 justify-center">
          <Package size={16} />
          Track Orders
        </Link>
        <Link to="/shop" className="btn-outline flex-1 justify-center">
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
