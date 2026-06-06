import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { format, isToday, isYesterday } from 'date-fns'
import { MessageSquare, Paperclip, Send, CheckCheck, Users } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { imageUrl, imageUrlAbsolute } from '@/components/common/getImageUrl'
import {
  useGetChatsQuery,
  useGetMessageListQuery,
  useSendMessageMutation,
} from '@/redux/slices/customer/chatApi'
import { UserContext } from '@/provider/UserContext'

type TParticipant = {
  id: string
  name: string
  email: string
  profile: string | null
  role: string
}

type TConversation = {
  id: string
  status: boolean
  groupName: string | null
  participants: TParticipant[]
  lastMessage: {
    text: string | null
    createdAt: string
    senderId: string
  } | null
}

type TMessage = {
  id: string
  chatId: string
  senderId: string
  text: string
  createdAt: string
  updatedAt: string
  resourceUrl: string | null
  type: 'text' | 'image'
  sender: {
    id: string
    name: string
    profile: string | null
  }
}

function sortMessagesOldestFirst(messages: TMessage[]): TMessage[] {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
}

function formatChatTime(iso?: string): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  if (isToday(date)) return format(date, 'hh:mm a')
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMM d')
}

function getChatTitle(chat: TConversation, myId?: string): string {
  if (chat.groupName?.trim()) return chat.groupName.trim()
  const others = chat.participants.filter((p) => p.id !== myId)
  if (others.length === 1) return others[0].name
  if (others.length > 1) return others.map((p) => p.name).join(', ')
  return chat.participants[0]?.name ?? 'Chat'
}

function getChatAvatarParticipant(
  chat: TConversation,
  myId?: string
): TParticipant | null {
  const others = chat.participants.filter((p) => p.id !== myId)
  return others[0] ?? chat.participants[0] ?? null
}

function getLastMessagePreview(chat: TConversation): string {
  const last = chat.lastMessage
  if (!last) return 'No messages yet'
  if (last.text?.trim()) return last.text.trim()
  return 'Image'
}

export default function Communication() {
  const { socket, user } = useContext(UserContext) as {
    socket: any
    user: { _id?: string; id?: string; name?: string; profile?: string | null } | null
  }
  const myId = user?._id ?? (user as { id?: string })?.id

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [messageInput, setMessageInput] = useState('')
  const [messageList, setMessageList] = useState<TMessage[]>([])
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { data: chatsData, isLoading: isChatsLoading } = useGetChatsQuery(undefined)
  const chats: TConversation[] = chatsData?.data ?? []

  const conversation = useMemo(
    () => chats.find((c) => c.id === selectedChatId) ?? null,
    [chats, selectedChatId]
  )

  useEffect(() => {
    if (chats.length === 0) {
      setSelectedChatId(null)
      return
    }
    if (!selectedChatId || !chats.some((c) => c.id === selectedChatId)) {
      setSelectedChatId(chats[0].id)
    }
  }, [chats, selectedChatId])

  const { data: messageData, isFetching: isMessagesLoading } = useGetMessageListQuery(
    selectedChatId ?? '',
    { skip: !selectedChatId }
  )

  const [sendMessage, { isLoading }] = useSendMessageMutation()

  useEffect(() => {
    if (messageData?.data) {
      setMessageList(sortMessagesOldestFirst(messageData.data))
    }
  }, [messageData])

  useEffect(() => {
    setMessageList([])
    setMessageInput('')
    setSelectedImage(null)
  }, [selectedChatId])

  useEffect(() => {
    if (!socket || !selectedChatId) return
    const event = `getMessage::${selectedChatId}`
    const handleNewMessage = (data: TMessage) => {
      setMessageList((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev
        return sortMessagesOldestFirst([...prev, data])
      })
    }
    socket.on(event, handleNewMessage)
    return () => {
      socket.off(event, handleNewMessage)
    }
  }, [socket, selectedChatId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messageList])

  const handleSendMessage = async () => {
    if ((!messageInput.trim() && !selectedImage) || !conversation) return

    const formData = new FormData()
    formData.append('chatId', conversation.id)
    if (selectedImage) {
      formData.append('image', selectedImage)
      formData.append('type', 'image')
    } else {
      formData.append('type', 'text')
    }
    formData.append('text', messageInput)

    const res = await sendMessage(formData)
    if ('data' in res && (res.data as { success?: boolean })?.success) {
      setMessageInput('')
      setSelectedImage(null)
    }
  }

  const headerParticipant = conversation
    ? getChatAvatarParticipant(conversation, myId)
    : null
  const isGroupChat = !!conversation?.groupName?.trim()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[calc(100vh-8rem)] flex bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm"
    >
      {/* Sidebar */}
      <aside className="w-full max-w-[320px] shrink-0 flex flex-col border-r border-gray-100 bg-white">
        <div className="px-4 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {chats.length} conversation{chats.length === 1 ? '' : 's'}
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
          {isChatsLoading ? (
            <p className="px-4 py-8 text-sm text-muted-foreground text-center">Loading...</p>
          ) : chats.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted-foreground text-center">
              No conversations found
            </p>
          ) : (
            chats.map((chat) => {
              const isActive = chat.id === selectedChatId
              const avatarParticipant = getChatAvatarParticipant(chat, myId)
              const title = getChatTitle(chat, myId)
              const isGroup = !!chat.groupName?.trim()

              return (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => setSelectedChatId(chat.id)}
                  className={cn(
                    'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50',
                    isActive ? 'bg-primary/5' : 'hover:bg-gray-50'
                  )}
                >
                  <Avatar className="h-11 w-11 shrink-0">
                    {isGroup ? (
                      <AvatarFallback className="bg-primary/15 text-primary">
                        <Users className="h-5 w-5" />
                      </AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage
                          src={
                            avatarParticipant?.profile
                              ? imageUrl(avatarParticipant.profile)
                              : undefined
                          }
                          alt={title}
                        />
                        <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                          {title.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </>
                    )}
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={cn(
                          'truncate text-sm font-semibold',
                          isActive ? 'text-primary' : 'text-gray-900'
                        )}
                      >
                        {title}
                      </p>
                      {chat.lastMessage?.createdAt ? (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatChatTime(chat.lastMessage.createdAt)}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {getLastMessagePreview(chat)}
                    </p>
                    {isGroup ? (
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {chat.participants.length} members
                      </p>
                    ) : null}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </aside>

      {/* Chat panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {conversation ? (
          <>
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-white shrink-0">
              <Avatar className="h-10 w-10 shrink-0">
                {isGroupChat ? (
                  <AvatarFallback className="bg-primary/15 text-primary">
                    <Users className="h-5 w-5" />
                  </AvatarFallback>
                ) : (
                  <>
                    <AvatarImage
                      src={
                        headerParticipant?.profile
                          ? imageUrl(headerParticipant.profile)
                          : undefined
                      }
                      alt={getChatTitle(conversation, myId)}
                    />
                    <AvatarFallback className="bg-primary/20 text-primary text-sm font-medium">
                      {getChatTitle(conversation, myId).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-accent truncate">
                  {getChatTitle(conversation, myId)}
                </p>
                {isGroupChat ? (
                  <p className="text-xs text-muted-foreground">
                    {conversation.participants.length} members
                  </p>
                ) : headerParticipant ? (
                  <p className="text-xs text-muted-foreground truncate">
                    {headerParticipant.email}
                  </p>
                ) : null}
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-6 py-4 space-y-4 bg-[#F7F7F7]"
            >
              {isMessagesLoading && messageList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Loading messages...</p>
              ) : messageList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No messages yet</p>
              ) : (
                messageList.map((msg) => {
                  const isMine = myId === msg.senderId
                  return (
                    <div
                      key={msg.id}
                      className={cn('flex gap-3', isMine ? 'flex-row-reverse' : 'flex-row')}
                    >
                      {!isMine && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage
                            src={
                              msg?.sender?.profile ? imageUrl(msg.sender.profile) : undefined
                            }
                          />
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {msg?.sender?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'flex flex-col max-w-[70%]',
                          isMine ? 'items-end' : 'items-start'
                        )}
                      >
                        {!isMine && (
                          <p className="text-xs font-medium text-muted-foreground mb-0.5">
                            {msg?.sender?.name}
                          </p>
                        )}
                        <div
                          className={cn(
                            'px-4 py-3',
                            isMine
                              ? 'bg-primary text-white rounded-t-lg rounded-bl-lg'
                              : 'bg-white text-gray-700 rounded-b-lg rounded-tr-lg'
                          )}
                        >
                          {msg.type === 'image' && msg.resourceUrl && (
                            <img
                              src={imageUrl(msg.resourceUrl)}
                              alt=""
                              className="w-full max-w-xs h-auto max-h-[240px] object-cover rounded-lg mb-2"
                              onError={(e) => {
                                const absolute = imageUrlAbsolute(msg.resourceUrl)
                                if (absolute && e.currentTarget.src !== absolute) {
                                  e.currentTarget.src = absolute
                                }
                              }}
                            />
                          )}
                          {msg.text && <p className="text-sm">{msg.text}</p>}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-muted-foreground">
                          <span className="text-xs">
                            {format(new Date(msg.createdAt), 'hh:mm a')}
                          </span>
                          {isMine && <CheckCheck className="h-3.5 w-3.5" strokeWidth={2.5} />}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            <div className="shrink-0 border-t border-gray-100 px-6 py-4 bg-white">
              {selectedImage && (
                <div className="mb-3">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt=""
                    className="h-16 w-16 object-cover rounded"
                  />
                </div>
              )}
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-accent shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type message..."
                  className="flex-1 rounded-full border-gray-200 h-11"
                />
                <Button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10 shrink-0 rounded-full"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-[#F7F7F7] gap-2">
            <MessageSquare className="h-10 w-10 opacity-40" />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
