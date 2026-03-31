import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import StatCard from '../../components/vendor/StatCard'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import { DollarSign, ShoppingBag, Package, Users, ArrowRight, Clock } from 'lucide-react'
import { format } from 'date-fns'

export default function Dashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, customers: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { data: orders },
        { count: products },
        { count: customers },
      ] = await Promise.all([
        supabase
          .from('orders')
          .select('*, profiles(first_name, last_name, email)')
          .order('created_at', { ascending: false }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      ])

      const revenue = (orders ?? [])
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + Number(o.total), 0)

      setStats({
        revenue,
        orders: orders?.length ?? 0,
        products: products ?? 0,
        customers: customers ?? 0,
      })
      setRecentOrders((orders ?? []).slice(0, 6))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back — here's your store at a glance.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${stats.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="green"
        />
        <StatCard icon={ShoppingBag} label="Total Orders" value={stats.orders} color="blue" />
        <StatCard icon={Package} label="Active Products" value={stats.products} color="brand" />
        <StatCard icon={Users} label="Customers" value={stats.customers} color="purple" />
      </div>

      {/* Recent orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-slate-900">Recent Orders</h2>
          <Link to="/vendor/orders" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">No orders yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Order</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {order.profiles
                        ? `${order.profiles.first_name} ${order.profiles.last_name}`
                        : 'Unknown'}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/vendor/products"
          className="card p-5 flex items-center gap-3 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
            <Package size={20} />
          </div>
          <div>
            <p className="font-medium text-slate-800 group-hover:text-brand-600 transition-colors">Manage Products</p>
            <p className="text-xs text-slate-400">Add, edit, or remove items</p>
          </div>
        </Link>
        <Link
          to="/vendor/orders"
          className="card p-5 flex items-center gap-3 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">Manage Orders</p>
            <p className="text-xs text-slate-400">Update status & fulfill</p>
          </div>
        </Link>
        <Link
          to="/vendor/messages"
          className="card p-5 flex items-center gap-3 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <Clock size={20} />
          </div>
          <div>
            <p className="font-medium text-slate-800 group-hover:text-purple-600 transition-colors">Customer Messages</p>
            <p className="text-xs text-slate-400">Reply to inquiries</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
