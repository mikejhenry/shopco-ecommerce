import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useCartStore } from '../../store/cartStore'
import { useAuth } from '../../context/AuthContext'
import { ShoppingCart, MessageSquare, ArrowLeft, Package, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'
import toast from 'react-hot-toast'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const addItem = useCartStore((s) => s.addItem)

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [imageIdx, setImageIdx] = useState(0)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        navigate('/shop', { replace: true })
        return
      }
      setProduct(data)
      setLoading(false)
    }
    load()
  }, [id, navigate])

  function handleAddToCart() {
    addItem(product, qty)
    toast.success(`${qty}× ${product.title} added to cart`)
  }

  async function handleContactVendor() {
    if (!isAuthenticated) {
      toast.error('Please sign in to contact the seller')
      navigate('/login')
      return
    }
    navigate('/messages', { state: { subject: `Inquiry about: ${product.title}` } })
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    )
  }

  const images = product.images ?? []
  const outOfStock = product.quantity < 1

  return (
    <div className="container-app py-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-slate-700">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-slate-700">Shop</Link>
        <span>/</span>
        <span className="text-slate-800 truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[imageIdx]}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package size={80} />
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setImageIdx((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setImageIdx((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImageIdx(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    i === imageIdx ? 'border-brand-500' : 'border-gray-200'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {product.category && (
            <Badge variant="info">{product.category}</Badge>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">
            {product.title}
          </h1>
          <div className="text-3xl font-extrabold text-slate-900">
            ${Number(product.price).toFixed(2)}
          </div>

          {/* Availability */}
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${outOfStock ? 'bg-red-400' : 'bg-green-400'}`} />
            <span className="text-sm text-slate-600">
              {outOfStock ? 'Out of Stock' : `${product.quantity} in stock`}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Qty selector */}
          {!outOfStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-gray-100 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.quantity, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-gray-100 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={handleAddToCart}
              disabled={outOfStock}
              size="lg"
              className="flex-1"
            >
              <ShoppingCart size={18} />
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Button
              variant="outline"
              onClick={handleContactVendor}
              size="lg"
              className="flex-1"
            >
              <MessageSquare size={18} />
              Ask the Seller
            </Button>
          </div>

          {/* Meta */}
          <div className="pt-4 border-t border-gray-100 text-xs text-slate-400 space-y-1">
            <p>SKU: {product.id.slice(0, 8).toUpperCase()}</p>
            {product.category && <p>Category: {product.category}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
