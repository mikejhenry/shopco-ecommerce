import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingBag, MessageSquare, BarChart2, LogOut, Menu, X, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/vendor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/vendor/products', icon: Package, label: 'Products' },
  { to: '/vendor/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/vendor/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/vendor/transactions', icon: BarChart2, label: 'Transactions' },
]

export default function VendorLayout() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleSignOut() {
    try {
      await signOut()
      navigate('/')
      toast.success('Signed out')
    } catch {
      toast.error('Sign out failed')
    }
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-500 text-white shadow-sm'
        : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
    }`

  const Sidebar = () => (
    <aside className="flex flex-col h-full w-60 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-16 border-b border-gray-200">
        <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
          <Package size={15} className="text-white" />
        </div>
        <span className="font-bold text-slate-900 text-sm">ShopCo Vendor</span>
      </div>

      {/* Profile */}
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
            {profile?.first_name?.[0]?.toUpperCase() ?? 'V'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-800 truncate">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs text-slate-400 truncate">{profile?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClass} onClick={() => setSidebarOpen(false)}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-gray-100 hover:text-slate-900 transition-colors"
        >
          <ExternalLink size={17} />
          View Store
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 flex flex-col">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-gray-200">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900">
            <Menu size={20} />
          </button>
          <span className="font-bold text-slate-900 text-sm">Vendor Dashboard</span>
          <div className="w-8" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
