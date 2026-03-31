import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Package, ChevronRight } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { format } from 'date-fns'

export default function MyOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(count)')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      setOrders(data ?? [])
      setLoading(false)
    }
    load()
  }, [user.id])

  if (loading) {
    return <div className="flex justify-center py-24"><Spinner size="lg" /></div>
  }

  return (
    <div className="container-app py-8 md:py-12 max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 card">
          <Package size={48} className="text-gray-200 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="font-semibold text-slate-700 mb-2">No orders yet</h2>
          <p className="text-sm text-slate-400 mb-6">Start shopping to see your orders here</p>
          <Link to="/shop" className="btn-primary px-8 py-2.5">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/my-orders/${order.id}`}
              className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
            >
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Package size={20} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs text-slate-500">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                  <Badge status={order.status}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Badge>
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  {format(new Date(order.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-slate-900">${Number(order.total).toFixed(2)}</p>
                <p className="text-xs text-slate-400">
                  {order.order_items?.[0]?.count ?? 0} item(s)
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
