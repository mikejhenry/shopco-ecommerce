import { Minus, Plus, Trash2, Package } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'

export default function CartItem({ item }) {
  const updateQty = useCartStore((s) => s.updateQty)
  const removeItem = useCartStore((s) => s.removeItem)

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Image */}
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
        {item.image ? (
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package size={28} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-800 truncate">{item.title}</p>
        <p className="text-sm font-semibold text-slate-900 mt-0.5">
          ${(item.price * item.qty).toFixed(2)}
        </p>
        <p className="text-xs text-slate-400">${item.price.toFixed(2)} each</p>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQty(item.id, item.qty - 1)}
            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-slate-600 hover:bg-gray-100 transition-colors"
          >
            <Minus size={12} />
          </button>
          <span className="text-sm font-medium w-6 text-center">{item.qty}</span>
          <button
            onClick={() => updateQty(item.id, item.qty + 1)}
            disabled={item.qty >= item.stock}
            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-slate-600 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={12} />
          </button>
          <button
            onClick={() => removeItem(item.id)}
            className="ml-auto p-1 text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
