import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import ConversationList from '../../components/messaging/ConversationList'
import MessageThread from '../../components/messaging/MessageThread'
import { MessageSquare } from 'lucide-react'

export default function VendorMessages() {
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadConversations() }, [])

  async function loadConversations() {
    const { data } = await supabase
      .from('conversations')
      .select('*, profiles(first_name, last_name, email)')
      .order('last_message_at', { ascending: false })
    setConversations(data ?? [])
    setLoading(false)
  }

  const selectedCustomerName = selected?.profiles
    ? `${selected.profiles.first_name} ${selected.profiles.last_name}`
    : 'Customer'

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <p className="text-slate-500 text-sm mt-1">Conversations with your customers</p>
      </div>

      <div className="card overflow-hidden" style={{ height: '72vh' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`w-full md:w-72 border-r border-gray-100 flex flex-col flex-shrink-0 ${selected ? 'hidden md:flex' : 'flex'}`}>
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-slate-700">
                All Conversations
                <span className="ml-1.5 text-slate-400 font-normal">({conversations.length})</span>
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={conversations}
                selectedId={selected?.id}
                onSelect={setSelected}
                loading={loading}
                nameKey="customer"
              />
            </div>
          </div>

          {/* Thread */}
          <div className={`flex-1 flex flex-col ${selected ? 'flex' : 'hidden md:flex'}`}>
            {selected ? (
              <>
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                  <button
                    onClick={() => setSelected(null)}
                    className="md:hidden text-slate-500 hover:text-slate-700 text-sm"
                  >
                    ←
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{selectedCustomerName}</p>
                    <p className="text-xs text-slate-400">{selected.profiles?.email}</p>
                    {selected.subject && (
                      <p className="text-xs text-slate-400 italic">Re: {selected.subject}</p>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <MessageThread
                    conversationId={selected.id}
                    otherName={selectedCustomerName}
                  />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <MessageSquare size={48} strokeWidth={1} />
                <p className="text-sm">Select a conversation to reply</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
