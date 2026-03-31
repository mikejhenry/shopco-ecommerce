import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import ConversationList from '../../components/messaging/ConversationList'
import MessageThread from '../../components/messaging/MessageThread'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import { Plus, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Messages() {
  const { user } = useAuth()
  const location = useLocation()
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newConvOpen, setNewConvOpen] = useState(false)
  const [subject, setSubject] = useState(location.state?.subject ?? '')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [user.id])

  // Auto-open new conversation modal if coming from product detail
  useEffect(() => {
    if (location.state?.subject) {
      setNewConvOpen(true)
    }
  }, [])

  async function loadConversations() {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .eq('customer_id', user.id)
      .order('last_message_at', { ascending: false })

    setConversations(data ?? [])
    setLoading(false)
  }

  async function handleCreateConversation(e) {
    e.preventDefault()
    if (!subject.trim()) return
    setCreating(true)
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ customer_id: user.id, subject: subject.trim() })
        .select()
        .single()
      if (error) throw error
      setConversations((prev) => [data, ...prev])
      setSelected(data)
      setNewConvOpen(false)
      setSubject('')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="container-app py-8 md:py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
        <Button onClick={() => setNewConvOpen(true)} size="sm">
          <Plus size={16} />
          New Message
        </Button>
      </div>

      <div className="card overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`w-full md:w-72 border-r border-gray-100 flex flex-col flex-shrink-0 ${selected ? 'hidden md:flex' : 'flex'}`}>
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-slate-700">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList
                conversations={conversations}
                selectedId={selected?.id}
                onSelect={(conv) => setSelected(conv)}
                loading={loading}
                nameKey="vendor"
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
                    className="md:hidden text-slate-500 hover:text-slate-700"
                  >
                    ←
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">ShopCo Support</p>
                    {selected.subject && (
                      <p className="text-xs text-slate-400">{selected.subject}</p>
                    )}
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <MessageThread conversationId={selected.id} otherName="ShopCo" />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                <MessageSquare size={48} strokeWidth={1} />
                <p className="text-sm">Select a conversation or start a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New conversation modal */}
      <Modal open={newConvOpen} onClose={() => setNewConvOpen(false)} title="New Message">
        <form onSubmit={handleCreateConversation} className="space-y-4">
          <p className="text-sm text-slate-500">
            Start a conversation with ShopCo support or ask about a product.
          </p>
          <Input
            label="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Question about my order"
            required
          />
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setNewConvOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={creating} className="flex-1">
              Start Conversation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
