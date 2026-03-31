import { useState, useRef, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, Menu, X, Package, LogOut, LayoutDashboard, MessageSquare, ChevronDown } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'

export default function Header() {
  const { isAuthenticated, isVendor, profile, signOut } = useAuth()
  const getCount = useCartStore((s) => s.getCount)
  const cartCount = getCount()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside — avoids z-index/stacking-context issues
  useEffect(() => {
    if (!userMenuOpen) return
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  async function handleSignOut() {
    setUserMenuOpen(false)
    try {
      await signOut()
      navigate('/')
      toast.success('Signed out successfully')
    } catch {
      toast.error('Sign out failed')
    }
  }

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'}`

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">ShopCo</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" end className={navLinkClass}>Home</NavLink>
            <NavLink to="/shop" className={navLinkClass}>Shop</NavLink>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative hidden md:block" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-slate-700"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-bold">
                    {profile?.first_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">
                    {profile?.first_name ?? 'Account'}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    {isVendor && (
                      <Link
                        to="/vendor"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50"
                      >
                        <LayoutDashboard size={15} />
                        Vendor Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50"
                    >
                      <User size={15} />
                      My Profile
                    </Link>
                    <Link
                      to="/my-orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50"
                    >
                      <Package size={15} />
                      My Orders
                    </Link>
                    <Link
                      to="/messages"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-gray-50"
                    >
                      <MessageSquare size={15} />
                      Messages
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50 w-full text-left"
                    >
                      <LogOut size={15} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-outline text-sm px-4 py-2">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-gray-100 rounded-lg"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <NavLink to="/" end className={navLinkClass} onClick={() => setMobileOpen(false)}>
            <div className="py-2">Home</div>
          </NavLink>
          <NavLink to="/shop" className={navLinkClass} onClick={() => setMobileOpen(false)}>
            <div className="py-2">Shop</div>
          </NavLink>
          {isAuthenticated ? (
            <>
              {isVendor && (
                <Link to="/vendor" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMobileOpen(false)}>
                  Vendor Dashboard
                </Link>
              )}
              <Link to="/profile" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMobileOpen(false)}>My Profile</Link>
              <Link to="/my-orders" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMobileOpen(false)}>My Orders</Link>
              <Link to="/messages" className="block py-2 text-sm font-medium text-slate-600" onClick={() => setMobileOpen(false)}>Messages</Link>
              <button onClick={handleSignOut} className="block w-full text-left py-2 text-sm font-medium text-red-600">
                Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn-outline flex-1 text-center text-sm py-2" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link to="/register" className="btn-primary flex-1 text-center text-sm py-2" onClick={() => setMobileOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
