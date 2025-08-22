import React, { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client'
import { useUserId } from '@nhost/react'
import { GET_CHATS } from '../graphql/queries'
import { SEND_MESSAGE, SEND_MESSAGE_ACTION, UPDATE_CHAT_TIMESTAMP } from '../graphql/mutations'
import { SUBSCRIBE_TO_MESSAGES } from '../graphql/subscriptions'
import { MessageBubble } from './MessageBubble'
import { Send, MessageSquare, AlertCircle, RefreshCw, Settings } from 'lucide-react'

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
  const [showDebug, setShowDebug] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const userId = useUserId()
  const apolloClient = useApolloClient()

  // Query for chat details
  const { data: chatData, loading: chatLoading, error: chatError } = useQuery(GET_CHATS, {
    variables: { user_id: userId },
    skip: !userId,
    onError: (error) => {
      console.error('Chat query error:', error)
      setError('Failed to load chat details. Please refresh the page.')
    }
  })

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
      setError('Failed to send message. Please try again.')
    }
  })

  const [sendMessageAction] = useMutation(SEND_MESSAGE_ACTION, {
    onCompleted: (data) => {
      console.log('✅ Message action completed:', data)
    },
    onError: (error) => {
      console.error('Message action error:', error)
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
      const messageResult = await sendMessage({
        variables: {
          chat_id: String(chatId),
          content: String(messageContent),
          user_id: String(userId)
        }
      })

      await updateChatTimestamp({
        variables: { chat_id: String(chatId) }
      })

      const userMessageId = messageResult?.data?.insert_messages_one?.id
      if (!userMessageId) {
        throw new Error('Failed to obtain inserted message id')
      }

      const actionVariables = {
        chat_id: String(chatId),
        message: String(messageContent),
        user_id: String(userId),
        message_id: String(userMessageId)
      }

      await sendMessageAction({
        variables: actionVariables
      })

      console.log('Message sent; bot action triggered')
    } catch (err) {
      console.error('Error in send flow:', err)
      setError('Failed to send message. Please try again.')
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
      <div className="h-full flex items-center justify-center bg-[rgb(250,248,245)] dark:bg-[rgb(25,25,25)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[rgb(191,114,46)] dark:border-[rgb(200,140,90)] border-t-transparent mx-auto mb-4"></div>
          <p className="text-[rgb(100,100,100)] dark:text-[rgb(160,160,160)]">Loading chat...</p>
        </div>
      </div>
    )
  }

  // Error state for critical chat loading failure
  if (chatError && !chatData) {
    return (
      <div className="h-full flex items-center justify-center bg-[rgb(250,248,245)] dark:bg-[rgb(25,25,25)]">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)] mb-2">
            Failed to Load Chat
          </h2>
          <p className="text-[rgb(100,100,100)] dark:text-[rgb(160,160,160)] mb-6">
            There was an error loading this chat.
          </p>
          <button
            onClick={handleRetry}
            className="bg-gradient-to-r from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
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
    <div className="h-full flex flex-col bg-[rgb(250,248,245)] dark:bg-[rgb(25,25,25)] transition-colors duration-300">
      {/* Header */}
      <div className="p-4 border-b border-[rgb(230,230,225)] dark:border-[rgb(50,50,50)] bg-white dark:bg-[rgb(40,40,40)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] rounded-lg flex items-center justify-center shadow-md">
              <span className="text-lg font-bold text-white">K</span>
            </div>
            <div>
              <h1 className="font-semibold text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)]">
                {chat?.title || 'Kirito Chat'}
              </h1>
              <p className="text-sm text-[rgb(100,100,100)] dark:text-[rgb(160,160,160)]">
                {allMessages.length} messages
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="p-2 rounded-lg bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] hover:bg-[rgb(240,240,235)] dark:hover:bg-[rgb(45,45,45)] transition-colors duration-300"
          >
            <Settings className="w-4 h-4 text-[rgb(100,100,100)] dark:text-[rgb(160,160,160)]" />
          </button>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <div className="mt-4 p-3 bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] rounded-lg border border-[rgb(220,150,80)] dark:border-[rgb(200,140,90)]">
            <div className="flex items-center justify-between text-xs text-[rgb(100,100,100)] dark:text-[rgb(160,160,160)]">
              <span>Chat ID: {chatId?.slice(0, 8)}...</span>
              <button
                onClick={handleClearCache}
                className="text-[rgb(191,114,46)] dark:text-[rgb(200,140,90)] hover:underline"
              >
                Clear Cache
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRetry}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
              >
                Retry
              </button>
              <button
                onClick={clearError}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-br from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-white">K</span>
              </div>
              <h3 className="text-xl font-semibold text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)] mb-2">
                Start the conversation
              </h3>
              <p className="text-[rgb(100,100,100)] dark:text-[rgb(160,160,160)]">
                Send a message to begin chatting with Kirito AI assistant
              </p>
            </div>
          </div>
        ) : (
          <>
            {allMessages.map((msg: Message) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                currentUserId={userId}
              />
            ))}
            {/* Typing indicator */}
            {isSending && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-white">K</span>
                </div>
                <div className="bg-white dark:bg-[rgb(40,40,40)] rounded-2xl p-4 shadow-md border border-[rgb(230,230,225)] dark:border-[rgb(50,50,50)]">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-[rgb(191,114,46)] dark:bg-[rgb(200,140,90)] rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-[rgb(191,114,46)] dark:bg-[rgb(200,140,90)] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-[rgb(191,114,46)] dark:bg-[rgb(200,140,90)] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-[rgb(230,230,225)] dark:border-[rgb(50,50,50)] bg-white dark:bg-[rgb(40,40,40)]">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <div className="flex-1">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isSending || !userId}
              className="w-full px-4 py-3 bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] border border-[rgb(220,150,80)] dark:border-[rgb(200,140,90)] rounded-xl focus:ring-2 focus:ring-[rgb(191,114,46)] dark:focus:ring-[rgb(200,140,90)] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)] placeholder-[rgb(120,120,120)] dark:placeholder-[rgb(140,140,140)]"
            />
          </div>
          <button
            type="submit"
            disabled={isSending || !userId || !message.trim()}
            className="bg-gradient-to-r from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] text-white p-3 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none flex items-center space-x-2"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span className="hidden sm:inline">Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>
        {!userId && (
          <p className="text-center text-red-500 dark:text-red-400 text-sm mt-2">
            Please log in to send messages
          </p>
        )}
      </div>
    </div>
  )
}
