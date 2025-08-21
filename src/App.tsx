import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { NhostProvider, useAuthenticated, useAuthenticationStatus } from '@nhost/react'
import { ApolloProvider } from '@apollo/client'
import { nhost } from './lib/nhost'
import { apolloClient } from './lib/apollo'
import { AuthForm } from './components/AuthForm'
import { ChatApp } from './components/ChatApp'

const AppContent: React.FC = () => {
  const isAuthenticated = useAuthenticated()
  const { isLoading } = useAuthenticationStatus()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
          <AppContent />
        </ApolloProvider>
      </NhostProvider>
    </BrowserRouter>
  )
}

export default App