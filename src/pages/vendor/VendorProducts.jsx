import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ProductForm from '../../components/products/ProductForm'
import Modal from '../../components/ui/Modal'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Spinner from '../../components/ui/Spinner'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Package } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VendorProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState(null)

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    setProducts(data ?? [])
    setLoading(false)
  }

  function openCreate() { setEditTarget(null); setFormOpen(true) }
  function openEdit(p) { setEditTarget(p); setFormOpen(true) }
  function closeForm() { setFormOpen(false); setEditTarget(null) }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    const { error } = await supabase.from('products').delete().eq('id', deleteTarget.id)
    if (error) {
      toast.error('Delete failed: ' + error.message)
    } else {
      toast.success('Product deleted')
      setProducts((p) => p.filter((x) => x.id !== deleteTarget.id))
    }
    setDeleting(false)
    setDeleteTarget(null)
  }

  async function toggleActive(product) {
    setToggling(product.id)
    const newVal = !product.is_active
    const { error } = await supabase
      .from('products')
      .update({ is_active: newVal, updated_at: new Date().toISOString() })
      .eq('id', product.id)

    if (error) {
      toast.error('Update failed')
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, is_active: newVal } : p))
      )
      toast.success(newVal ? 'Product is now active' : 'Product hidden from store')
    }
    setToggling(null)
  }

  if (loading) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm mt-1">{products.length} products total</p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="card p-12 text-center">
          <Package size={48} className="text-gray-200 mx-auto mb-4" strokeWidth={1.5} />
          <h2 className="font-semibold text-slate-700 mb-2">No products yet</h2>
          <p className="text-slate-400 text-sm mb-5">Add your first product to start selling</p>
          <Button onClick={openCreate}>
            <Plus size={16} />
            Add First Product
          </Button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Qty</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate max-w-[200px]">{p.title}</p>
                          <p className="text-xs text-slate-400 font-mono">{p.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-800">${Number(p.price).toFixed(2)}</td>
                    <td className="px-5 py-3">
                      <span className={p.quantity === 0 ? 'text-red-500 font-medium' : 'text-slate-700'}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{p.category ?? '—'}</td>
                    <td className="px-5 py-3">
                      <Badge status={p.is_active ? 'active' : 'inactive'}>
                        {p.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActive(p)}
                          disabled={toggling === p.id}
                          className="p-1.5 text-slate-400 hover:text-brand-600 transition-colors rounded"
                          title={p.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {p.is_active ? <ToggleRight size={18} className="text-brand-500" /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors rounded"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product form modal */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editTarget ? 'Edit Product' : 'Add New Product'}
        size="lg"
      >
        <ProductForm
          product={editTarget}
          onSuccess={() => { closeForm(); loadProducts() }}
          onCancel={closeForm}
        />
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete product?"
        message={`"${deleteTarget?.title}" will be permanently deleted and removed from the store. This cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
  )
}
