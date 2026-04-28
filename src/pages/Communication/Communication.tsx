import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Paperclip, Send, CheckCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  type Conversation,
  type Message,
} from './communicationData'
import { cn } from '@/utils/cn'

function getTimeString() {
  const now = new Date()
  const hours = now.getHours()
  const mins = now.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${mins.toString().padStart(2, '0')}${ampm}`
}

function getTimeForList() {
  const now = new Date()
  const hours = now.getHours()
  const mins = now.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${mins.toString().padStart(2, '0')}${ampm}`
}

const adminConversationInitial: Conversation = {
  id: 'admin-support',
  type: 'employee',
  name: 'Admin Support',
  avatar: 'https://i.pravatar.cc/150?u=admin-support',
  lastMessage: 'Admin: Got it — we’ll check and update you.',
  lastMessageIsFromYou: false,
  lastMessageTime: '09:10AM',
  messages: [
    {
      id: 'seed-1',
      senderId: 'me',
      senderName: 'You',
      text: 'I’m facing an issue in the project — the updates are not saving. Can you help?',
      timestamp: '09:02AM',
      isOutgoing: true,
      isRead: true,
    },
    {
      id: 'seed-2',
      senderId: 'admin',
      senderName: 'Admin',
      senderAvatar: 'https://i.pravatar.cc/150?u=admin-support',
      text: 'Understood. Please share your Project ID / Order ID and tell us which screen you’re seeing the issue on.',
      timestamp: '09:04AM',
      isOutgoing: false,
      isRead: true,
    },
    {
      id: 'seed-3',
      senderId: 'me',
      senderName: 'You',
      text: 'Also, I’d like to talk to someone from the admin team. Who is available?',
      timestamp: '09:06AM',
      isOutgoing: true,
      isRead: true,
    },
    {
      id: 'seed-4',
      senderId: 'admin',
      senderName: 'Admin',
      senderAvatar: 'https://i.pravatar.cc/150?u=admin-support',
      text: 'Got it — we’ll check and update you. If it’s urgent, please send “Urgent”.',
      timestamp: '09:10AM',
      isOutgoing: false,
      isRead: true,
    },
  ],
}

export default function Communication() {
  const { t } = useTranslation()
  const [conversations, setConversations] = useState<Conversation[]>([
    JSON.parse(JSON.stringify(adminConversationInitial)),
  ])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    () => conversations[0] ?? null
  )
  const [messageInput, setMessageInput] = useState('')

  const handleSendMessage = () => {
    const text = messageInput.trim()
    if (!text || !selectedConversation) return
    const now = getTimeString()
    const listTime = getTimeForList()
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: 'me',
      senderName: 'You',
      text,
      timestamp: now,
      isOutgoing: true,
      isRead: true,
    }
    const updated = {
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      lastMessage: text,
      lastMessageIsFromYou: true,
      lastMessageTime: listTime,
    }
    setConversations((prev) =>
      prev.map((conv) => (conv.id === selectedConversation.id ? updated : conv))
    )
    setSelectedConversation(updated)
    setMessageInput('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-8rem)] flex bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
    >
      {/* Right Panel - Chat */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {selectedConversation ? (
          <>
            <ChatHeader conversation={selectedConversation} />
            <MessageList messages={selectedConversation.messages} />
            <ChatInput
              value={messageInput}
              onChange={setMessageInput}
              onSend={handleSendMessage}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p className="text-sm">{t('communication.selectConversation')}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ChatHeader({ conversation }: { conversation: Conversation }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarImage src={conversation.avatar} alt={conversation.name} />
        <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
          {conversation.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <p className="font-semibold text-accent">{conversation.name}</p>
    </div>
  )
}

function MessageList({ messages }: { messages: Message[] }) {
  const { t } = useTranslation()
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4 space-y-4">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          {t('communication.noMessages')}
        </p>
      ) : (
        messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-3',
              msg.isOutgoing ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {!msg.isOutgoing && (
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={msg.senderAvatar} />
                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                  {msg.senderName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div
              className={cn(
                'flex flex-col max-w-[70%]',
                msg.isOutgoing ? 'items-end' : 'items-start'
              )}
            >
              {!msg.isOutgoing && (
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  {msg.senderName}
                </p>
              )}
              <div
                className={cn(
                  ' px-4 py-4',
                  msg.isOutgoing
                    ? 'bg-secondary-foreground text-accent'
                    : 'bg-secondary-foreground text-accent',
                    msg.isOutgoing ? 'rounded-t-lg rounded-bl-lg' : 'rounded-b-lg rounded-tr-lg'
                )}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                <span className="text-xs">{msg.timestamp}</span>
                {msg.isOutgoing && (
                  <CheckCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

interface ChatInputProps {
  value: string
  onChange: (v: string) => void
  onSend: () => void
}

function ChatInput({ value, onChange, onSend }: ChatInputProps) {
  const { t } = useTranslation()
  return (
    <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-white">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-accent shrink-0"
      >
        <Paperclip className="h-5 w-5" />
      </Button>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
          }
        }}
        placeholder={t('communication.messagePlaceholder')}
        className="flex-1 rounded-full border-gray-200 h-11"
      />
      <Button
        type="button"
        onClick={onSend}
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0 rounded-full"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  )
}
