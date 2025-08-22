import React, { useState } from 'react'
import { useMutation } from '@apollo/client'
import { useSignOut } from '@nhost/react'
import { ChatList } from './ChatList'
import { ChatWindow } from './ChatWindow'
import { CREATE_CHAT } from '../graphql/mutations'
import { LogOut, MessageSquare, Sun, Moon, Menu } from 'lucide-react'
import { useUserId } from '@nhost/react'
import { useTheme } from '../contexts/ThemeContext'

export const ChatApp: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [createChat] = useMutation(CREATE_CHAT)
  const { signOut } = useSignOut()
  const userId = useUserId()
  const { theme, toggleTheme } = useTheme()

  const handleCreateChat = async () => {
    try {
      const chatTitle = "New Chat"
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
    <div className="h-screen bg-[rgb(245,245,240)] dark:bg-[rgb(30,30,30)] transition-colors duration-300 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-white dark:bg-[rgb(40,40,40)] border-r border-[rgb(220,150,80)] dark:border-[rgb(50,50,50)] flex flex-col`}>
        {/* Header */}
        <div className="p-6 border-b border-[rgb(230,230,225)] dark:border-[rgb(50,50,50)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] rounded-lg flex items-center justify-center shadow-md">
                <span className="text-xl font-bold text-white">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)]">Kirito Chat</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] hover:bg-[rgb(240,240,235)] dark:hover:bg-[rgb(45,45,45)] transition-colors duration-300"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-[rgb(200,140,90)]" />
                ) : (
                  <Moon className="w-4 h-4 text-[rgb(191,114,46)]" />
                )}
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] hover:bg-red-50 dark:hover:bg-red-900/20 text-[rgb(100,100,100)] hover:text-red-600 transition-colors duration-300"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={handleCreateChat}
            className="w-full bg-gradient-to-r from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-5 h-5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-hidden">
          <ChatList
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
            onCreateChat={handleCreateChat}
            userId={userId}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className={`${sidebarOpen ? 'lg:hidden' : ''} p-4 bg-white dark:bg-[rgb(40,40,40)] border-b border-[rgb(220,150,80)] dark:border-[rgb(50,50,50)] flex items-center justify-between lg:hidden`}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] hover:bg-[rgb(240,240,235)] dark:hover:bg-[rgb(45,45,45)] transition-colors duration-300"
          >
            <Menu className="w-5 h-5 text-[rgb(100,100,100)] dark:text-[rgb(160,160,160)]" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-white">K</span>
            </div>
            <span className="font-semibold text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)]">Kirito Chat</span>
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-1 overflow-hidden">
          {selectedChatId ? (
            <ChatWindow chatId={selectedChatId} />
          ) : (
            <div className="h-full flex items-center justify-center bg-[rgb(250,248,245)] dark:bg-[rgb(25,25,25)]">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <MessageSquare className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)] mb-4">
                  Welcome to Kirito Chat
                </h2>
                <p className="text-[rgb(100,100,100)] dark:text-[rgb(160,160,160)] mb-8">
                  Select a chat from the sidebar or create a new one to start your conversation with AI
                </p>
                <button
                  onClick={handleCreateChat}
                  className="bg-gradient-to-r from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] text-white py-3 px-6 rounded-xl font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 inline-flex items-center space-x-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Start New Chat</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:block fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-[rgb(40,40,40)] shadow-lg border border-[rgb(220,150,80)] dark:border-[rgb(50,50,50)] hover:shadow-xl transition-all duration-300"
      >
        <Menu className="w-5 h-5 text-[rgb(100,100,100)] dark:text-[rgb(160,160,160)]" />
      </button>
    </div>
  )
}
