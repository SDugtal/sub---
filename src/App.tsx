import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { NhostProvider, useAuthenticated, useAuthenticationStatus } from '@nhost/react'
import { ApolloProvider } from '@apollo/client'
import { nhost } from './lib/nhost'
import { apolloClient } from './lib/apollo'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthForm } from './components/AuthForm'
import { ChatApp } from './components/ChatApp'

const AppContent: React.FC = () => {
  const isAuthenticated = useAuthenticated()
  const { isLoading } = useAuthenticationStatus()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(245,245,240)] dark:bg-[rgb(30,30,30)] flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[rgb(191,114,46)] dark:border-[rgb(200,140,90)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[rgb(100,100,100)] dark:text-[rgb(160,160,160)]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthForm onSuccess={() => {}} />
  }

  return <ChatApp />
}

function App() {
  return (
    <BrowserRouter>
      <NhostProvider nhost={nhost}>
        <ApolloProvider client={apolloClient}>
          <ThemeProvider>
            <div className="font-sans antialiased">
              <AppContent />
            </div>
          </ThemeProvider>
        </ApolloProvider>
      </NhostProvider>
    </BrowserRouter>
  )
}

export default App
