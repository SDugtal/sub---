import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client'
import { useUserId } from '@nhost/react'
import { GET_CHATS } from '../graphql/queries'
import { SEND_MESSAGE, SEND_MESSAGE_ACTION, UPDATE_CHAT_TIMESTAMP } from '../graphql/mutations'
import { SUBSCRIBE_TO_MESSAGES } from '../graphql/subscriptions'
import { MessageBubble } from './MessageBubble'
import { Send, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react'

interface ChatWindowProps {
  chatId: string
}

interface Message {
  id: string
  content: string
  user_id: string
  created_at: string
  is_bot: boolean
}

interface SendMessageActionVariables {
  chat_id: string
  message: string
  message_id: string
  user_id: string
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ chatId }) => {
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const userId = useUserId()
  const apolloClient = useApolloClient()

  // Query for chat details
const { data: chatData, loading: chatLoading, error: chatError } = useQuery(GET_CHATS, {
  variables: { user_id: userId },   // 👈 include user_id
  skip: !userId,                                     // 👈 avoid running until userId is ready
  onError: (error) => {
    console.error('Chat query error:', error)
    setError('Failed to load chat details. Please refresh the page.')
  }
})

console.log(chatData);

  

  // Subscription for real-time messages
  const { data: messagesData, error: subscriptionError } = useSubscription(SUBSCRIBE_TO_MESSAGES, {
    variables: { chat_id: chatId },
    skip: !chatId,
    onError: (error) => {
      console.error('Subscription error:', error)
      setError('Failed to connect to chat. Please refresh the page.')
    },
    onData: ({ data }) => {
      console.log('✅ Received message data:', data)
      setError(null)
      setOptimisticMessages([])
    }
  })

  // Mutations
  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: (error) => {
      console.error('Send message error:', error)
      console.error('GraphQL errors:', error.graphQLErrors)
      console.error('Network error:', error.networkError)
      setError('Failed to send message. Please try again.')
    }
  })

  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION, {
    onCompleted: (data) => {
      console.log('✅ Message action completed:', data)
    },
    onError: (error) => {
      console.error('Message action error:', error)
      console.error('GraphQL errors:', error.graphQLErrors)
      console.error('Network error:', error.networkError)
      console.error('Full error details:', JSON.stringify(error, null, 2))
      setError('Failed to trigger AI response. Please try again.')
    }
  })

  const [updateChatTimestamp] = useMutation(UPDATE_CHAT_TIMESTAMP, {
    onError: (error) => {
      console.error('Update timestamp error:', error)
    }
  })

  // Combine real messages with optimistic messages
  const realMessages = messagesData?.data?.messages || messagesData?.messages || []
  const allMessages = [...realMessages, ...optimisticMessages]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [allMessages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || isSending || !userId) return

    const messageContent = message.trim()
    const tempId = `temp-${Date.now()}`

    const optimisticMessage: Message = {
      id: tempId,
      content: messageContent,
      user_id: userId,
      created_at: new Date().toISOString(),
      is_bot: false
    }

    setOptimisticMessages([optimisticMessage])
    setMessage('')
    setIsSending(true)
    setError(null)

    try {
      // Insert user message
      console.log('Sending message with variables:', {
        chat_id: chatId,
        content: messageContent,
        user_id: userId
      })

      const messageResult = await sendMessage({
        variables: {
          chat_id: String(chatId),
          content: String(messageContent),
          user_id: String(userId)
        }
      })

      console.log('Message result:', messageResult)

      // Update chat timestamp (best-effort)
      await updateChatTimestamp({
        variables: { chat_id: String(chatId) }
      })

      // Extract inserted message id and ensure it's present
      const userMessageId = messageResult?.data?.insert_messages_one?.id
      if (!userMessageId) {
        throw new Error('Failed to obtain inserted message id')
      }

      console.log('User message ID:', userMessageId, 'Type:', typeof userMessageId)

      // Ensure all variables are properly typed for the action
      const actionVariables = {
        chat_id: String(chatId),
        message: String(messageContent),
        user_id: String(userId),
        message_id: String(userMessageId)
      }

      console.log('Sending action with variables:', actionVariables)

      // Trigger bot action (Hasura action/webhook)
      await sendMessageAction({
        variables: actionVariables
      })

      // Success: optimistic message will be replaced by subscription
      console.log('Message sent; bot action triggered')
    } catch (err) {
      console.error('Error in send flow:', err)
      setError('Failed to send message. Please try again.')
      // restore typed message and clear optimistic UI
      setMessage(messageContent)
      setOptimisticMessages([])
    } finally {
      setIsSending(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    window.location.reload()
  }

  const clearError = () => {
    setError(null)
  }

  const handleClearCache = async () => {
    try {
      await apolloClient.clearStore()
      console.log('✅ Apollo cache cleared')
      setError(null)
    } catch (err) {
      console.error('❌ Failed to clear cache:', err)
    }
  }

  // Loading state
  if (chatLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-400 animate-spin" />
          <p className="text-gray-500">Loading chat...</p>
        </div>
      </div>
    )
  }

  // Error state for critical chat loading failure
  if (chatError && !chatData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Chat</h3>
          <p className="text-gray-500 mb-4">There was an error loading this chat.</p>
          <button
            onClick={handleRetry}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

 const chats = chatData?.chats || []
const chat = chats.find((c: any) => c.id === chatId)

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {chat?.title || 'Chat'}
        </h2>
        <p className="text-sm text-gray-500">
          {allMessages.length} messages
        </p>
        {/* Debug info - remove in production */}
        <div className="text-xs text-gray-400 mt-1">
          Chat ID: {chatId?.slice(0, 8)}...
          <button
            onClick={handleClearCache}
            className="ml-2 text-blue-500 underline hover:text-blue-700"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleRetry}
                className="text-red-600 hover:text-red-800 text-sm underline"
              >
                Retry
              </button>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800 text-sm underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {allMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h3>
              <p>Send a message to begin chatting with the AI assistant</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {allMessages.map((msg: Message) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                currentUserId={userId}
                isOptimistic={msg.id.startsWith('temp-')}
              />
            ))}
            
            {/* Typing indicator */}
            {isSending && (
              <div className="flex items-start gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded-lg max-w-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">AI is thinking</span>
                    <div className="flex gap-1 ml-2">
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isSending || !userId}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          <button
            type="submit"
            disabled={!message.trim() || isSending || !userId}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>
        
        {!userId && (
          <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Please log in to send messages
          </p>
        )}
      </div>
    </div>
  )
}
