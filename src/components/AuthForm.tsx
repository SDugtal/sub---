import React, { useState } from 'react'
import { useSignInEmailPassword, useSignUpEmailPassword } from '@nhost/react'
import { Mail, Lock, User, AlertCircle, Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface AuthFormProps {
  onSuccess: () => void
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { theme, toggleTheme } = useTheme()

  const {
    signInEmailPassword,
    isLoading: signInLoading,
    isError: signInError,
    error: signInErrorDetails
  } = useSignInEmailPassword()

  const {
    signUpEmailPassword,
    isLoading: signUpLoading,
    isError: signUpError,
    error: signUpErrorDetails
  } = useSignUpEmailPassword()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSignUp) {
      const result = await signUpEmailPassword(email, password)
      if (result.isSuccess) {
        onSuccess()
      }
    } else {
      const result = await signInEmailPassword(email, password)
      if (result.isSuccess) {
        onSuccess()
      }
    }
  }

  const isLoading = signInLoading || signUpLoading
  const error = signInError || signUpError
  const errorMessage = signInErrorDetails?.message || signUpErrorDetails?.message

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(245,245,240)] to-[rgb(250,248,245)] dark:from-[rgb(30,30,30)] dark:to-[rgb(25,25,25)] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-[rgb(50,50,50)] shadow-lg hover:shadow-xl transition-all duration-300 border border-[rgb(220,150,80)] dark:border-[rgb(200,140,90)]"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-[rgb(200,140,90)]" />
            ) : (
              <Moon className="w-5 h-5 text-[rgb(191,114,46)]" />
            )}
          </button>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">K</span>
          </div>
          <h1 className="text-3xl font-bold text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)] mb-2">
            {isSignUp ? 'Join Kirito Chat' : 'Welcome Back'}
          </h1>
          <p className="text-[rgb(100,100,100)] dark:text-[rgb(160,160,160)]">
            {isSignUp ? 'Create your account to start chatting' : 'Sign in to continue your conversations'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-[rgb(40,40,40)] rounded-2xl shadow-xl p-8 border border-[rgb(230,230,225)] dark:border-[rgb(60,60,60)] transition-colors duration-300">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-300 text-sm">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(70,70,70)] dark:text-[rgb(200,200,200)] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(150,150,150)] dark:text-[rgb(130,130,130)] w-5 h-5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] border border-[rgb(220,150,80)] dark:border-[rgb(200,140,90)] rounded-xl focus:ring-2 focus:ring-[rgb(191,114,46)] dark:focus:ring-[rgb(200,140,90)] focus:border-transparent transition-all duration-300 text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)] placeholder-[rgb(120,120,120)] dark:placeholder-[rgb(140,140,140)]"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(70,70,70)] dark:text-[rgb(200,200,200)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(150,150,150)] dark:text-[rgb(130,130,130)] w-5 h-5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] border border-[rgb(220,150,80)] dark:border-[rgb(200,140,90)] rounded-xl focus:ring-2 focus:ring-[rgb(191,114,46)] dark:focus:ring-[rgb(200,140,90)] focus:border-transparent transition-all duration-300 text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)] placeholder-[rgb(120,120,120)] dark:placeholder-[rgb(140,140,140)]"
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Please wait...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {isSignUp ? <User className="w-5 h-5 mr-2" /> : <Mail className="w-5 h-5 mr-2" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[rgb(191,114,46)] dark:text-[rgb(200,140,90)] hover:text-[rgb(170,95,40)] dark:hover:text-[rgb(180,120,80)] text-sm font-medium transition-colors duration-300"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
