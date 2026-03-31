import { formatDistanceToNow } from 'date-fns'
import { MessageSquare } from 'lucide-react'
import Spinner from '../ui/Spinner'

export default function ConversationList({ conversations, selectedId, onSelect, loading, nameKey = 'customer' }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
        <MessageSquare size={36} strokeWidth={1.5} />
        <p className="text-sm">No conversations yet</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conv) => {
        const isSelected = conv.id === selectedId
        const displayName =
          nameKey === 'customer'
            ? `${conv.profiles?.first_name ?? ''} ${conv.profiles?.last_name ?? ''}`.trim() || 'Customer'
            : 'ShopCo Support'

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
              isSelected ? 'bg-brand-50 border-r-2 border-brand-500' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-sm font-bold flex-shrink-0">
              {displayName[0]?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium truncate ${isSelected ? 'text-brand-700' : 'text-slate-800'}`}>
                  {displayName}
                </p>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                </span>
              </div>
              {conv.subject && (
                <p className="text-xs text-slate-500 truncate mt-0.5">{conv.subject}</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
