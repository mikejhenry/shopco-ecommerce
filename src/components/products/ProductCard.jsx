import { Link } from 'react-router-dom'
import { ShoppingCart, Package } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import toast from 'react-hot-toast'

export default function ProductCard({ product }) {
  const addItem = useCartStore((s) => s.addItem)

  function handleAddToCart(e) {
    e.preventDefault()
    if (product.quantity < 1) return
    addItem(product, 1)
    toast.success(`${product.title} added to cart`)
  }

  const image = product.images?.[0]
  const outOfStock = product.quantity < 1

  return (
    <Link
      to={`/shop/${product.id}`}
      className="card group flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-200"
    >
      {/* Image */}
      <div className="aspect-square bg-gray-100 overflow-hidden relative">
        {image ? (
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package size={48} />
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        {product.category && (
          <span className="text-xs text-brand-600 font-medium uppercase tracking-wide">
            {product.category}
          </span>
        )}
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
          {product.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 flex-1">{product.description}</p>

        <div className="flex items-center justify-between mt-1">
          <div>
            <span className="text-lg font-bold text-slate-900">
              ${Number(product.price).toFixed(2)}
            </span>
            {!outOfStock && (
              <p className="text-xs text-slate-400">{product.quantity} available</p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="p-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  )
}
