import React from 'react'
import { Bot, User } from 'lucide-react'

interface Message {
  id: string
  content: string
  is_bot: boolean
  created_at: string
  user_id: string
}

interface MessageBubbleProps {
  message: Message
  currentUserId?: string
  isOptimistic?: boolean
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  currentUserId,
  isOptimistic = false 
}) => {
  const isBot = message.is_bot
  const isCurrentUser = message.user_id === currentUserId

  return (
    <div className={`flex items-start space-x-3 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
        isBot 
          ? 'bg-gradient-to-br from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)]'
          : 'bg-gradient-to-br from-[rgb(100,100,200)] to-[rgb(150,150,250)]'
      }`}>
        {isBot ? (
          <Bot className="w-4 h-4 text-white" />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isBot ? 'items-start' : 'items-end'}`}>
        <div className={`rounded-2xl p-4 shadow-md border transition-all duration-300 ${
          isBot
            ? 'bg-white dark:bg-[rgb(40,40,40)] border-[rgb(230,230,225)] dark:border-[rgb(50,50,50)] text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)]'
            : 'bg-gradient-to-br from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] text-white border-transparent'
        } ${isOptimistic ? 'opacity-70' : ''}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs mt-1 px-2 ${
          isBot 
            ? 'text-[rgb(120,120,120)] dark:text-[rgb(140,140,140)]'
            : 'text-[rgb(120,120,120)] dark:text-[rgb(140,140,140)]'
        } ${isOptimistic ? 'opacity-50' : ''}`}>
          {isOptimistic ? 'Sending...' : new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  )
}
