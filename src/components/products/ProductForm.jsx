import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Toys', 'Health & Beauty', 'Other']

export default function ProductForm({ product, onSuccess, onCancel }) {
  const isEditing = !!product
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    quantity: '',
    category: '',
    is_active: true,
    images: [],
  })

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title ?? '',
        description: product.description ?? '',
        price: String(product.price ?? ''),
        quantity: String(product.quantity ?? ''),
        category: product.category ?? '',
        is_active: product.is_active ?? true,
        images: product.images ?? [],
      })
    }
  }, [product])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB')
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filename, file, { cacheControl: '3600', upsert: false })

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path)

      set('images', [...form.images, urlData.publicUrl])
      toast.success('Image uploaded')
    } catch (err) {
      toast.error('Image upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  function removeImage(url) {
    set('images', form.images.filter((i) => i !== url))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.title.trim()) return toast.error('Title is required')
    const price = parseFloat(form.price)
    const quantity = parseInt(form.quantity, 10)
    if (isNaN(price) || price < 0) return toast.error('Enter a valid price')
    if (isNaN(quantity) || quantity < 0) return toast.error('Enter a valid quantity')

    setLoading(true)
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        price,
        quantity,
        category: form.category || null,
        is_active: form.is_active,
        images: form.images,
        updated_at: new Date().toISOString(),
      }

      let error
      if (isEditing) {
        ;({ error } = await supabase.from('products').update(payload).eq('id', product.id))
      } else {
        ;({ error } = await supabase.from('products').insert(payload))
      }

      if (error) throw error
      toast.success(isEditing ? 'Product updated' : 'Product created')
      onSuccess?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Product Title"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        placeholder="e.g. Wireless Noise-Cancelling Headphones"
        required
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={4}
          placeholder="Describe your product..."
          className="input-base resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (USD)"
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => set('price', e.target.value)}
          placeholder="0.00"
          required
        />
        <Input
          label="Quantity Available"
          type="number"
          min="0"
          step="1"
          value={form.quantity}
          onChange={(e) => set('quantity', e.target.value)}
          placeholder="0"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Category</label>
        <select
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          className="input-base"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Images */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Product Images</label>
        <div className="flex flex-wrap gap-2">
          {form.images.map((url) => (
            <div key={url} className="relative w-20 h-20">
              <img src={url} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
              >
                <X size={11} />
              </button>
            </div>
          ))}
          <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-400 transition-colors">
            {uploading ? (
              <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Upload size={18} className="text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Upload</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Active toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => set('is_active', !form.is_active)}
          className={`relative w-11 h-6 rounded-full transition-colors ${form.is_active ? 'bg-brand-500' : 'bg-gray-300'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.is_active ? 'translate-x-5' : ''}`}
          />
        </button>
        <span className="text-sm text-slate-700">
          {form.is_active ? 'Active (visible to customers)' : 'Inactive (hidden from store)'}
        </span>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} className="flex-1">
          {isEditing ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
