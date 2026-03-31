import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Package } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { format } from 'date-fns'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: orderData }, { data: itemsData }] = await Promise.all([
        supabase.from('orders').select('*').eq('id', id).single(),
        supabase.from('order_items').select('*, products(images)').eq('order_id', id),
      ])
      setOrder(orderData)
      setItems(itemsData ?? [])
      setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  if (!order) return <div className="container-app py-16 text-center text-slate-500">Order not found</div>

  return (
    <div className="container-app py-8 md:py-12 max-w-2xl">
      <Link to="/my-orders" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6">
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Placed {format(new Date(order.created_at), 'MMMM d, yyyy')}
          </p>
        </div>
        <Badge status={order.status}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Badge>
      </div>

      {/* Items */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-slate-800 mb-4">Items</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                {item.products?.images?.[0] ? (
                  <img src={item.products.images[0]} alt={item.product_title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={22} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{item.product_title}</p>
                <p className="text-xs text-slate-400">Qty: {item.quantity} × ${Number(item.price_at_purchase).toFixed(2)}</p>
              </div>
              <span className="font-semibold text-slate-800 text-sm">
                ${(item.price_at_purchase * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-slate-900">
          <span>Total</span>
          <span>${Number(order.total).toFixed(2)}</span>
        </div>
      </div>

      {/* Shipping */}
      {order.shipping_address && (
        <div className="card p-5 mb-5">
          <h2 className="font-semibold text-slate-800 mb-3">Shipping Address</h2>
          <p className="text-sm text-slate-600">
            {order.shipping_address.line1}
            {order.shipping_address.line2 && `, ${order.shipping_address.line2}`}<br />
            {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip}
          </p>
        </div>
      )}

      {/* Payment */}
      <div className="card p-5">
        <h2 className="font-semibold text-slate-800 mb-3">Payment</h2>
        <div className="text-sm text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span>Method</span><span className="font-medium">PayPal</span>
          </div>
          {order.paypal_capture_id && (
            <div className="flex justify-between">
              <span>Transaction ID</span>
              <span className="font-mono text-xs">{order.paypal_capture_id}</span>
            </div>
          )}
        </div>
      </div>

      <Link to="/messages" className="btn-outline w-full mt-5 justify-center">
        Have a question? Message the seller
      </Link>
    </div>
  )
}
