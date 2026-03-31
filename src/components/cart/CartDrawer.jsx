import { X, ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import CartItem from './CartItem'
import Button from '../ui/Button'

export default function CartDrawer({ open, onClose }) {
  const items = useCartStore((s) => s.items)
  const getTotal = useCartStore((s) => s.getTotal)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-slate-700" />
            <h2 className="font-semibold text-slate-900">Your Cart</h2>
            <span className="text-xs text-slate-400">({items.length} items)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
              <ShoppingBag size={48} strokeWidth={1} />
              <p className="text-sm">Your cart is empty</p>
              <Link to="/shop" onClick={onClose} className="btn-primary text-sm px-4 py-2">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-900">${getTotal().toFixed(2)}</span>
            </div>
            <Link to="/checkout" onClick={onClose} className="btn-primary w-full text-center">
              Proceed to Checkout
            </Link>
            <Link to="/cart" onClick={onClose} className="btn-outline w-full text-center text-sm">
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
