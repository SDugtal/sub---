import React from 'react'
import { useQuery } from '@apollo/client'
import { GET_CHATS } from '../graphql/queries'
import { MessageSquare, Clock } from 'lucide-react'

interface Chat {
  id: string
  title: string
  created_at: string
  updated_at: string
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
  const { data, loading } = useQuery(GET_CHATS, {
    variables: { user_id: userId },
    pollInterval: 5000,
    fetchPolicy: 'cache-and-network'
  })

  const chats = data?.chats || []

  if (loading && chats.length === 0) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-[rgb(240,240,235)] dark:bg-[rgb(35,35,35)] rounded-xl h-16"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-2">
        {chats.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-[rgb(150,150,150)] dark:text-[rgb(120,120,120)] mx-auto mb-4" />
            <p className="text-[rgb(100,100,100)] dark:text-[rgb(160,160,160)] text-sm">
              No chats yet
            </p>
            <p className="text-[rgb(120,120,120)] dark:text-[rgb(140,140,140)] text-xs mt-1">
              Create your first chat to get started
            </p>
          </div>
        ) : (
          chats.map((chat: Chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`w-full p-3 rounded-xl text-left transition-all duration-300 group ${
                selectedChatId === chat.id
                  ? 'bg-gradient-to-r from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] text-white shadow-lg transform scale-[1.02]'
                  : 'bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] hover:bg-[rgb(240,240,235)] dark:hover:bg-[rgb(45,45,45)] text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)] hover:shadow-md hover:transform hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  selectedChatId === chat.id
                    ? 'bg-white/20'
                    : 'bg-[rgb(191,114,46)] dark:bg-[rgb(200,140,90)]'
                }`}>
                  <MessageSquare className={`w-4 h-4 ${
                    selectedChatId === chat.id
                      ? 'text-white'
                      : 'text-white'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium truncate ${
                    selectedChatId === chat.id
                      ? 'text-white'
                      : 'text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)]'
                  }`}>
                    {chat.title === "New Chat" ? (
                      <span className="italic opacity-75">Generating title...</span>
                    ) : (
                      chat.title
                    )}
                  </h3>
                  <div className={`flex items-center space-x-2 mt-1 text-xs ${
                    selectedChatId === chat.id
                      ? 'text-white/70'
                      : 'text-[rgb(120,120,120)] dark:text-[rgb(140,140,140)]'
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{new Date(chat.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
