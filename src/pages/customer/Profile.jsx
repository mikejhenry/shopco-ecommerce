import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { User, Mail, Phone, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function Profile() {
  const { profile, updateProfile, user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: profile?.first_name ?? '',
    last_name: profile?.last_name ?? '',
    phone: profile?.phone ?? '',
  })
  const [errors, setErrors] = useState({})

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const errs = {}
    if (!form.first_name.trim()) errs.first_name = 'First name is required'
    if (!form.last_name.trim()) errs.last_name = 'Last name is required'
    if (form.phone && !/^[\d\s\-\+\(\)]{7,15}$/.test(form.phone)) errs.phone = 'Invalid phone'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await updateProfile({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: form.phone.trim() || null,
      })
      toast.success('Profile updated')
      setEditing(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleCancel() {
    setForm({
      first_name: profile?.first_name ?? '',
      last_name: profile?.last_name ?? '',
      phone: profile?.phone ?? '',
    })
    setErrors({})
    setEditing(false)
  }

  return (
    <div className="container-app py-8 md:py-12 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">My Profile</h1>

      {/* Avatar card */}
      <div className="card p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-2xl font-bold flex-shrink-0">
          {profile?.first_name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {profile?.first_name} {profile?.last_name}
          </h2>
          <p className="text-sm text-slate-500">{profile?.email}</p>
          <span className="inline-block mt-1 text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full capitalize font-medium">
            {profile?.role}
          </span>
        </div>
      </div>

      {/* Profile form */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-slate-900">Account Information</h2>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit Profile
            </Button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={form.first_name}
                onChange={(e) => set('first_name', e.target.value)}
                error={errors.first_name}
                required
              />
              <Input
                label="Last Name"
                value={form.last_name}
                onChange={(e) => set('last_name', e.target.value)}
                error={errors.last_name}
                required
              />
            </div>
            <Input
              label="Phone Number"
              type="tel"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              error={errors.phone}
              placeholder="+1 (555) 000-0000"
            />
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Mail size={12} />
              Email cannot be changed. Contact support if needed.
            </p>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" loading={loading} className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-sm">
            <InfoRow icon={User} label="Full Name" value={`${profile?.first_name ?? ''} ${profile?.last_name ?? ''}`} />
            <InfoRow icon={Mail} label="Email" value={profile?.email} />
            <InfoRow icon={Phone} label="Phone" value={profile?.phone ?? '—'} />
            <InfoRow icon={Calendar} label="Member Since" value={profile?.created_at ? format(new Date(profile.created_at), 'MMMM yyyy') : '—'} />
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <Icon size={16} className="text-slate-400 flex-shrink-0" />
      <div className="flex-1 flex items-center justify-between">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium text-slate-800">{value}</span>
      </div>
    </div>
  )
}
