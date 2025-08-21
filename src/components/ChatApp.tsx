  import React, { useState } from 'react'
  import { useMutation } from '@apollo/client'
  import { useSignOut } from '@nhost/react'
  import { ChatList } from './ChatList'
  import { ChatWindow } from './ChatWindow'
  import { CREATE_CHAT } from '../graphql/mutations'
  import { LogOut, MessageSquare } from 'lucide-react'
  import { useUserId } from '@nhost/react'
  export const ChatApp: React.FC = () => {
    const [selectedChatId, setSelectedChatId] = useState<string | undefined>()
    const [createChat] = useMutation(CREATE_CHAT)
    const { signOut } = useSignOut()
    const userId = useUserId()
    const handleCreateChat = async () => {
      try {
        const chatTitle = `Chat ${new Date().toLocaleDateString()}`
        const result = await createChat({
          variables: { title: chatTitle, user_id: userId },
          refetchQueries: ['GetChats']
        })
        if (result.data?.insert_chats_one) {
          setSelectedChatId(result.data.insert_chats_one.id) 
        }
      } catch (error) {
        console.error('Error creating chat:', error)
      }
    }

    const handleSignOut = async () => {
      await signOut()
    }

    return (
      <div className="h-screen bg-white flex">
        {/* Sidebar */}
        <div className="flex flex-col">
          <div className="bg-gray-50 border-b border-gray-200 p-4 w-80">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                ChatBot
              </h1>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <ChatList
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
            onCreateChat={handleCreateChat}
            userId={userId}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedChatId ? (
            <ChatWindow chatId={selectedChatId} />
            
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to ChatBot</h2>
                <p className="text-gray-600 mb-6">
                  Select a chat from the sidebar or create a new one to get started
                </p>
                <button
                  onClick={handleCreateChat}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }