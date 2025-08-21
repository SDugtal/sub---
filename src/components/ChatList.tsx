import React from 'react'
import { useQuery } from '@apollo/client'
import { GET_CHATS } from '../graphql/queries'
import { MessageSquare, Plus } from 'lucide-react'

interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
  messages_aggregate: {
    aggregate: {
      count: number
    }
  }
}

interface ChatListProps {
  selectedChatId?: string
  onSelectChat: (chatId: string) => void
  onCreateChat: () => void
  userId: string | undefined
}

export const ChatList: React.FC<ChatListProps> = ({
  selectedChatId,
  onSelectChat,
  onCreateChat,
  userId
}) => {
  const { data, loading, refetch } = useQuery(GET_CHATS, {
    variables: { user_id: userId },
    pollInterval: 2000, // Poll every 2 seconds for updates
    fetchPolicy: 'cache-and-network' // Always fetch fresh data
  })

  const chats = data?.chats || []

  if (loading && chats.length === 0) {
    return (
      <div className="w-80 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onCreateChat}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No chats yet</p>
            <p className="text-sm">Create your first chat to get started</p>
          </div>
        ) : (
          <div className="p-2">
            {chats.map((chat: Chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-3 rounded-lg mb-2 text-left transition-colors ${
                  selectedChatId === chat.id
                    ? 'bg-blue-100 border border-blue-200'
                    : 'bg-white hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <div className="font-medium text-gray-900 truncate">
                  {chat.title}
                </div>
                <div className="text-sm text-gray-500 flex justify-between items-center mt-1">
                  {/* <span>{chat.messages_aggregate.aggregate.count} messages</span> */}
                  <span>{new Date(chat.updated_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}