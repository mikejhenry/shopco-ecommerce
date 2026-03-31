import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import ProductCard from '../../components/products/ProductCard'
import Spinner from '../../components/ui/Spinner'
import { Search, SlidersHorizontal, X } from 'lucide-react'

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Health & Beauty', 'Other']
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A–Z' },
]
const PAGE_SIZE = 12

export default function Shop() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('is_active', true)

      if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)
      if (category !== 'All') query = query.eq('category', category)

      if (sort === 'newest') query = query.order('created_at', { ascending: false })
      else if (sort === 'price_asc') query = query.order('price', { ascending: true })
      else if (sort === 'price_desc') query = query.order('price', { ascending: false })
      else if (sort === 'name_asc') query = query.order('title', { ascending: true })

      query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

      const { data, count, error } = await query
      if (!error) {
        setProducts(data ?? [])
        setTotal(count ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }, [search, category, sort, page])

  useEffect(() => {
    setPage(0)
  }, [search, category, sort])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  function clearFilters() {
    setSearch('')
    setCategory('All')
    setSort('newest')
    setPage(0)
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const hasFilters = search || category !== 'All'

  return (
    <div className="container-app py-8 md:py-12">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">All Products</h1>
        <p className="text-slate-500 text-sm mt-1">{total} products available</p>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="input-base pl-9"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="input-base w-full sm:w-44"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`btn-outline flex items-center gap-2 sm:hidden ${showFilters ? 'bg-gray-100' : ''}`}
        >
          <SlidersHorizontal size={16} />
          Filters {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Category sidebar — desktop */}
        <aside className="hidden sm:block w-44 flex-shrink-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Category</p>
          <div className="space-y-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  category === c
                    ? 'bg-brand-500 text-white font-medium'
                    : 'text-slate-600 hover:bg-gray-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 text-xs text-red-500 hover:text-red-600 flex items-center gap-1">
              <X size={12} /> Clear filters
            </button>
          )}
        </aside>

        {/* Mobile category filter */}
        {showFilters && (
          <div className="sm:hidden absolute z-10 bg-white border border-gray-200 rounded-xl shadow-lg p-3 mt-1 w-48">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => { setCategory(c); setShowFilters(false) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  category === c ? 'bg-brand-500 text-white font-medium' : 'text-slate-600 hover:bg-gray-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Products grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg font-medium mb-2">No products found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
              {hasFilters && (
                <button onClick={clearFilters} className="mt-4 text-brand-600 text-sm hover:underline">
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-500 px-3">
                    Page {page + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
