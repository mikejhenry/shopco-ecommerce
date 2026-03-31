import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import { ShoppingBag, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
const FILTER_OPTIONS = ['all', ...STATUSES]

export default function VendorOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [detailOrder, setDetailOrder] = useState(null)
  const [detailItems, setDetailItems] = useState([])
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState('')

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(first_name, last_name, email, phone)')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }

  async function openDetail(order) {
    setDetailOrder(order)
    setNewStatus(order.status)
    const { data } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id)
    setDetailItems(data ?? [])
  }

  async function handleUpdateStatus() {
    if (!detailOrder || newStatus === detailOrder.status) return
    setUpdating(true)
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', detailOrder.id)

    if (error) {
      toast.error('Update failed: ' + error.message)
    } else {
      toast.success('Order status updated')
      setOrders((prev) =>
        prev.map((o) => (o.id === detailOrder.id ? { ...o, status: newStatus } : o))
      )
      setDetailOrder((d) => ({ ...d, status: newStatus }))
    }
    setUpdating(false)
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
        <p className="text-slate-500 text-sm mt-1">{filtered.length} orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
              filter === s
                ? 'bg-brand-500 text-white'
                : 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50'
            }`}
          >
            {s === 'all' ? 'All Orders' : s}
            <span className="ml-1.5 text-[10px]">
              ({s === 'all' ? orders.length : orders.filter((o) => o.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <ShoppingBag size={48} className="text-gray-200 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-slate-500 text-sm">No orders found</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  {['Order ID', 'Customer', 'Date', 'Total', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">
                        {order.profiles
                          ? `${order.profiles.first_name} ${order.profiles.last_name}`
                          : 'Guest'}
                      </p>
                      <p className="text-xs text-slate-400">{order.profiles?.email}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      ${Number(order.total).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={order.status}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Button size="sm" variant="outline" onClick={() => openDetail(order)}>
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order detail modal */}
      <Modal
        open={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        title={`Order #${detailOrder?.id?.slice(0, 8).toUpperCase()}`}
        size="lg"
      >
        {detailOrder && (
          <div className="space-y-5">
            {/* Customer info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Customer</p>
                <p className="font-medium text-slate-800">
                  {detailOrder.profiles
                    ? `${detailOrder.profiles.first_name} ${detailOrder.profiles.last_name}`
                    : 'Guest'}
                </p>
                <p className="text-slate-500">{detailOrder.profiles?.email}</p>
                {detailOrder.profiles?.phone && (
                  <p className="text-slate-500">{detailOrder.profiles.phone}</p>
                )}
              </div>
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Date</p>
                <p className="font-medium text-slate-800">
                  {format(new Date(detailOrder.created_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>

            {/* Shipping */}
            {detailOrder.shipping_address && (
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wide mb-1">Ship To</p>
                <p className="text-sm text-slate-600">
                  {detailOrder.shipping_address.line1}
                  {detailOrder.shipping_address.line2 && `, ${detailOrder.shipping_address.line2}`},{' '}
                  {detailOrder.shipping_address.city}, {detailOrder.shipping_address.state}{' '}
                  {detailOrder.shipping_address.zip}
                </p>
              </div>
            )}

            {/* Items */}
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Items</p>
              <div className="space-y-2 text-sm">
                {detailItems.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-slate-700">{item.product_title} ×{item.quantity}</span>
                    <span className="font-medium text-slate-800">
                      ${(item.price_at_purchase * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-slate-900">
                  <span>Total</span>
                  <span>${Number(detailOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status update */}
            <div className="border-t border-gray-100 pt-4">
              <p className="text-slate-400 text-xs uppercase tracking-wide mb-2">Update Status</p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="input-base appearance-none pr-8"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <Button
                  onClick={handleUpdateStatus}
                  loading={updating}
                  disabled={newStatus === detailOrder.status}
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
