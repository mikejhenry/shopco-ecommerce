import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Truck, RefreshCw, HeadphonesIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import ProductCard from '../../components/products/ProductCard'
import Spinner from '../../components/ui/Spinner'

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: ShieldCheck, title: 'Secure Payments', desc: 'PayPal protected checkout' },
  { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: HeadphonesIcon, title: '24/7 Support', desc: 'We\'re here to help' },
]

export default function Home() {
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .gt('quantity', 0)
        .order('created_at', { ascending: false })
        .limit(8)
      setFeatured(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-24 px-4">
        <div className="container-app text-center">
          <span className="inline-block text-brand-400 text-sm font-semibold uppercase tracking-widest mb-4">
            Welcome to ShopCo
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Quality Products,<br />
            <span className="text-brand-400">Unbeatable Prices</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-xl mx-auto mb-8">
            Discover our curated collection of premium products. Shop with confidence and enjoy fast delivery.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/shop" className="btn-primary px-8 py-3 text-base">
              Shop Now <ArrowRight size={18} />
            </Link>
            <Link to="/register" className="btn-outline border-slate-500 text-white hover:bg-white/10 hover:border-white px-8 py-3 text-base">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Feature badges */}
      <section className="bg-brand-500 py-6">
        <div className="container-app">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 text-white">
                <Icon size={22} className="flex-shrink-0 text-brand-100" />
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs text-brand-100 hidden sm:block">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-app py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Featured Products</h2>
            <p className="text-slate-500 text-sm mt-1">Our latest arrivals, handpicked for you</p>
          </div>
          <Link to="/shop" className="flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p>No products available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="bg-slate-900 text-white py-16 px-4 text-center">
        <div className="container-app max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Ready to Start Shopping?</h2>
          <p className="text-slate-400 mb-6">
            Create your free account today and get access to exclusive deals and order tracking.
          </p>
          <Link to="/register" className="btn-primary px-8 py-3 text-base">
            Get Started — It's Free
          </Link>
        </div>
      </section>
    </div>
  )
}
