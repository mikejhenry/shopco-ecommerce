const variants = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
}

const statusMap = {
  pending:   'warning',
  paid:      'success',
  shipped:   'info',
  delivered: 'success',
  cancelled: 'danger',
  active:    'success',
  inactive:  'default',
}

export default function Badge({ children, variant, status, className = '' }) {
  const resolvedVariant = status ? (statusMap[status] ?? 'default') : (variant ?? 'default')
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[resolvedVariant]} ${className}`}
    >
      {children}
    </span>
  )
}
