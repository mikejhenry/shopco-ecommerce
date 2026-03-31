import { Link } from 'react-router-dom'
import { ShoppingBag, ArrowRight, Trash2 } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import CartItem from '../../components/cart/CartItem'
import Button from '../../components/ui/Button'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useState } from 'react'

export default function Cart() {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const getTotal = useCartStore((s) => s.getTotal)
  const [confirmClear, setConfirmClear] = useState(false)

  if (items.length === 0) {
    return (
      <div className="container-app py-16 text-center">
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag size={36} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800">Your cart is empty</h2>
          <p className="text-slate-500 text-sm">Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="btn-primary px-8 py-3">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-app py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Shopping Cart</h1>
        <button
          onClick={() => setConfirmClear(true)}
          className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          <Trash2 size={14} />
          Clear cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 card p-5">
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </div>

        {/* Summary */}
        <div className="card p-5 h-fit">
          <h2 className="font-semibold text-slate-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-slate-600">
                <span className="truncate mr-2">{item.title} ×{item.qty}</span>
                <span className="font-medium text-slate-800 flex-shrink-0">
                  ${(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-slate-900">
              <span>Subtotal</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-400">Shipping calculated at checkout</p>
          </div>

          <Link to="/checkout" className="btn-primary w-full mt-5 justify-center">
            Checkout <ArrowRight size={16} />
          </Link>
          <Link to="/shop" className="btn-outline w-full mt-3 justify-center text-sm">
            Continue Shopping
          </Link>
        </div>
      </div>

      <ConfirmDialog
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => { clearCart(); setConfirmClear(false) }}
        title="Clear cart?"
        message="This will remove all items from your cart. This action cannot be undone."
        confirmLabel="Clear Cart"
      />
    </div>
  )
}
