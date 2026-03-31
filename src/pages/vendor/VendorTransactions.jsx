import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import StatCard from '../../components/vendor/StatCard'
import { DollarSign, TrendingUp, ShoppingBag, XCircle } from 'lucide-react'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'

export default function VendorTransactions() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles(first_name, last_name, email)')
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }

  // Derived stats
  const paid = orders.filter((o) => o.status !== 'cancelled')
  const cancelled = orders.filter((o) => o.status === 'cancelled')
  const totalRevenue = paid.reduce((s, o) => s + Number(o.total), 0)

  // This month
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const thisMonthRevenue = paid
    .filter((o) => {
      const d = new Date(o.created_at)
      return d >= monthStart && d <= monthEnd
    })
    .reduce((s, o) => s + Number(o.total), 0)

  // Filtered list
  const filtered = orders.filter((o) => {
    const customerName = o.profiles
      ? `${o.profiles.first_name} ${o.profiles.last_name} ${o.profiles.email}`
      : ''
    const matchSearch =
      !search ||
      o.id.includes(search) ||
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      (o.paypal_capture_id ?? '').toLowerCase().includes(search.toLowerCase())

    const matchStatus = statusFilter === 'all' || o.status === statusFilter

    const orderDate = new Date(o.created_at)
    const matchFrom = !dateFrom || orderDate >= new Date(dateFrom)
    const matchTo = !dateTo || orderDate <= new Date(dateTo + 'T23:59:59')

    return matchSearch && matchStatus && matchFrom && matchTo
  })

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="text-slate-500 text-sm mt-1">Full payment and order history</p>
      </div>

      {/* Revenue stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub="All time"
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="This Month"
          value={`$${thisMonthRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          sub={format(now, 'MMMM yyyy')}
          color="blue"
        />
        <StatCard
          icon={ShoppingBag}
          label="Paid Orders"
          value={paid.length}
          color="brand"
        />
        <StatCard
          icon={XCircle}
          label="Cancelled"
          value={cancelled.length}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by ID, customer, PayPal ref..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-base flex-1 min-w-[200px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-base w-36"
        >
          <option value="all">All Status</option>
          {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="input-base w-40"
          placeholder="From"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="input-base w-40"
          placeholder="To"
        />
        {(search || statusFilter !== 'all' || dateFrom || dateTo) && (
          <button
            onClick={() => { setSearch(''); setStatusFilter('all'); setDateFrom(''); setDateTo('') }}
            className="text-sm text-red-500 hover:text-red-700 px-2"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 text-sm text-slate-500">
          Showing {filtered.length} of {orders.length} transactions
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left">
                {['Order ID', 'Customer', 'Date', 'Amount', 'Status', 'PayPal Ref'].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    No transactions match your filters
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
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
                      {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`font-bold ${order.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-green-700'}`}>
                        ${Number(order.total).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge status={order.status}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-400 max-w-[140px] truncate">
                      {order.paypal_capture_id ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer total */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
            <div className="text-sm">
              <span className="text-slate-500 mr-2">Filtered revenue:</span>
              <span className="font-bold text-slate-900">
                ${filtered
                  .filter((o) => o.status !== 'cancelled')
                  .reduce((s, o) => s + Number(o.total), 0)
                  .toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
