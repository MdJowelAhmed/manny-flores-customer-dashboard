export type ConversationType = 'customer' | 'employee'

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderAvatar?: string
  text: string
  timestamp: string
  isOutgoing: boolean
  isRead?: boolean
}

export interface Conversation {
  id: string
  type: ConversationType
  name: string
  avatar?: string
  lastMessage: string
  lastMessageIsFromYou?: boolean
  lastMessageTime: string
  messages: Message[]
}

export const mockCustomerConversations: Conversation[] = [
  {
    id: 'c1',
    type: 'customer',
    name: 'Marc Marquez',
    avatar: 'https://i.pravatar.cc/150?u=marc',
    lastMessage: "I don't know what you're...",
    lastMessageIsFromYou: false,
    lastMessageTime: '12:50PM',
    messages: [
      {
        id: 'm1',
        senderId: 's1',
        senderName: 'Edward Davidson',
        senderAvatar: 'https://i.pravatar.cc/150?u=edward',
        text: 'Hi! I need to discuss pool cleaning for my backyard. Can you help?',
        timestamp: '10:08',
        isOutgoing: false,
        isRead: true,
      },
      {
        id: 'm2',
        senderId: 'me',
        senderName: 'You',
        text: "Of course! I'd be happy to help. What's the size of your pool?",
        timestamp: '10:10',
        isOutgoing: true,
        isRead: true,
      },
      {
        id: 'm3',
        senderId: 's1',
        senderName: 'David Wayne',
        senderAvatar: 'https://i.pravatar.cc/150?u=david',
        text: "It's about 20 by 40 feet. The pool is in good condition, just needs regular cleaning.",
        timestamp: '10:12',
        isOutgoing: false,
        isRead: true,
      },
      {
        id: 'm4',
        senderId: 'me',
        senderName: 'You',
        text: 'Perfect! I can schedule a weekly cleaning. Does Monday work for you?',
        timestamp: '10:15',
        isOutgoing: true,
        isRead: true,
      },
      {
        id: 'm5',
        senderId: 'me',
        senderName: 'You',
        text: 'Great, see you then!',
        timestamp: '10:16',
        isOutgoing: true,
        isRead: true,
      },
    ],
  },
  {
    id: 'c2',
    type: 'customer',
    name: 'Imogen',
    avatar: 'https://i.pravatar.cc/150?u=imogen',
    lastMessage: 'Kisses! 👋',
    lastMessageIsFromYou: false,
    lastMessageTime: '08:20PM',
    messages: [
      {
        id: 'm6',
        senderId: 's2',
        senderName: 'Imogen',
        senderAvatar: 'https://i.pravatar.cc/150?u=imogen',
        text: 'Thanks for the great service!',
        timestamp: '08:15',
        isOutgoing: false,
      },
      {
        id: 'm7',
        senderId: 'me',
        senderName: 'You',
        text: 'You\'re welcome! Glad we could help.',
        timestamp: '08:18',
        isOutgoing: true,
      },
    ],
  },
  {
    id: 'c3',
    type: 'customer',
    name: 'Alex Thompson',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    lastMessage: 'You: Why?',
    lastMessageIsFromYou: true,
    lastMessageTime: '02:00PM',
    messages: [],
  },
]

export const mockEmployeeConversations: Conversation[] = [
  {
    id: 'e1',
    type: 'employee',
    name: 'Sarah Miller',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    lastMessage: 'I can start the job tomorrow.',
    lastMessageIsFromYou: false,
    lastMessageTime: '11:30AM',
    messages: [
      {
        id: 'em1',
        senderId: 'e1',
        senderName: 'Sarah Miller',
        senderAvatar: 'https://i.pravatar.cc/150?u=sarah',
        text: 'Hi, I\'ve completed the inspection at 123 Main St.',
        timestamp: '11:25',
        isOutgoing: false,
      },
      {
        id: 'em2',
        senderId: 'me',
        senderName: 'You',
        text: 'Great, please send the report.',
        timestamp: '11:28',
        isOutgoing: true,
      },
    ],
  },
]
