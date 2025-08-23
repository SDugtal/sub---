import React, { useState } from 'react'
import { useSignInEmailPassword, useSignUpEmailPassword } from '@nhost/react'
import { Mail, Lock, User, AlertCircle, Sun, Moon, Check, X, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface AuthFormProps {
  onSuccess: () => void
}

interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showVerificationBanner, setShowVerificationBanner] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
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

  // Password validation
  const validatePassword = (pwd: string): PasswordRequirements => {
    return {
      minLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    }
  }

  const passwordRequirements = validatePassword(password)
  const isPasswordValid = Object.values(passwordRequirements).every(req => req)
  const doPasswordsMatch = password === confirmPassword && confirmPassword !== ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignUp) {
      console.log('🔍 Starting signup process...')
      
      // Additional validation for sign up
      if (!name.trim()) {
        console.log('❌ Name is required')
        return
      }
      if (!isPasswordValid) {
        console.log('❌ Password validation failed')
        return
      }
      if (!doPasswordsMatch) {
        console.log('❌ Passwords do not match')
        return
      }
      
      console.log('✅ Validation passed, calling signUpEmailPassword...')
      
      try {
        // Include displayName and metadata with the actual name
        const result = await signUpEmailPassword(email, password, {
          displayName: name.trim(),
          metadata: {
            firstName: name.trim().split(' ')[0],
            lastName: name.trim().split(' ').slice(1).join(' ') || '',
            fullName: name.trim()
          }
        })
        
        console.log('📋 Signup result:', result)
        console.log('📋 Result.isSuccess:', result.isSuccess)
        console.log('📋 Result.error:', result.error)
        console.log('📋 Result.needsEmailVerification:', result.needsEmailVerification)
        
        // Check for success OR if email verification is needed (both mean account was created)
        if (result.isSuccess || result.needsEmailVerification) {
          console.log('🎉 Signup successful! Redirecting to login...')
          
          // Store email and redirect to sign in with verification banner
          setSignupEmail(email)
          setIsSignUp(false)
          setShowVerificationBanner(true)
          
          // Clear form
          setName('')
          setEmail('')
          setPassword('')
          setConfirmPassword('')
          setShowPassword(false)
          setShowConfirmPassword(false)
          
          console.log('✅ State updated, should show verification banner now')
          
          // Auto-scroll to top to show the banner
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          console.log('❌ Signup failed:', result.error)
        }
      } catch (error) {
        console.error('💥 Signup error:', error)
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

        {/* Verification Success Banner */}
        {showVerificationBanner && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 rounded-r-xl shadow-lg animate-pulse">
            <div className="flex items-start">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="ml-3 flex-1">
                <h3 className="text-green-800 dark:text-green-300 font-semibold text-sm">
                  Account Created Successfully! 🎉
                </h3>
                <div className="mt-2 text-green-700 dark:text-green-300 text-sm space-y-2">
                  <p>
                    We've sent a verification email to <strong>{signupEmail}</strong>
                  </p>
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded border-l-2 border-yellow-400">
                    <p className="text-yellow-800 dark:text-yellow-300 text-xs font-medium">
                      📧 <strong>Important:</strong> Please check your <strong>Gmail spam/junk folder</strong> if you don't see the email in your inbox within a few minutes.
                    </p>
                  </div>
                  <p className="text-xs">
                    Click the verification link in the email to activate your account, then sign in below.
                  </p>
                </div>
                <button
                  onClick={() => setShowVerificationBanner(false)}
                  className="mt-3 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 text-xs underline"
                >
                  Got it, dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[rgb(191,114,46)] to-[rgb(242,175,116)] dark:from-[rgb(150,90,36)] dark:to-[rgb(200,140,90)] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">S</span>
          </div>
          <h1 className="text-3xl font-bold text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)] mb-2">
            {isSignUp ? 'Join SageSense Chat' : 'Welcome Back'}
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
              {/* Name Field - Only for Sign Up */}
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-[rgb(70,70,70)] dark:text-[rgb(200,200,200)] mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(150,150,150)] dark:text-[rgb(130,130,130)] w-5 h-5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] border border-[rgb(220,150,80)] dark:border-[rgb(200,140,90)] rounded-xl focus:ring-2 focus:ring-[rgb(191,114,46)] dark:focus:ring-[rgb(200,140,90)] focus:border-transparent transition-all duration-300 text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)] placeholder-[rgb(120,120,120)] dark:placeholder-[rgb(140,140,140)]"
                      placeholder="Enter your full name"
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                  {name && name.trim().length < 2 && (
                    <p className="text-red-500 text-xs mt-1">Name must be at least 2 characters</p>
                  )}
                </div>
              )}

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
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] border border-[rgb(220,150,80)] dark:border-[rgb(200,140,90)] rounded-xl focus:ring-2 focus:ring-[rgb(191,114,46)] dark:focus:ring-[rgb(200,140,90)] focus:border-transparent transition-all duration-300 text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)] placeholder-[rgb(120,120,120)] dark:placeholder-[rgb(140,140,140)]"
                    placeholder="Enter your password"
                    minLength={isSignUp ? 8 : 6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[rgb(150,150,150)] dark:text-[rgb(130,130,130)] hover:text-[rgb(191,114,46)] dark:hover:text-[rgb(200,140,90)] transition-colors duration-300"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password for Sign Up */}
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-[rgb(70,70,70)] dark:text-[rgb(200,200,200)] mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[rgb(150,150,150)] dark:text-[rgb(130,130,130)] w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-11 pr-12 py-3 bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-300 text-[rgb(50,50,50)] dark:text-[rgb(220,220,220)] placeholder-[rgb(120,120,120)] dark:placeholder-[rgb(140,140,140)] ${
                        confirmPassword && (doPasswordsMatch 
                          ? 'border-green-400 focus:ring-green-400' 
                          : 'border-red-400 focus:ring-red-400')
                      } ${!confirmPassword ? 'border-[rgb(220,150,80)] dark:border-[rgb(200,140,90)] focus:ring-[rgb(191,114,46)] dark:focus:ring-[rgb(200,140,90)]' : ''}`}
                      placeholder="Confirm your password"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      {confirmPassword && (
                        <div className="mr-1">
                          {doPasswordsMatch ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-[rgb(150,150,150)] dark:text-[rgb(130,130,130)] hover:text-[rgb(191,114,46)] dark:hover:text-[rgb(200,140,90)] transition-colors duration-300"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {confirmPassword && !doPasswordsMatch && (
                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                  )}
                </div>
              )}

              {/* Password Requirements for Sign Up */}
              {isSignUp && password && (
                <div className="p-4 bg-[rgb(248,248,245)] dark:bg-[rgb(35,35,35)] rounded-xl border border-[rgb(220,150,80)] dark:border-[rgb(200,140,90)]">
                  <h4 className="text-sm font-medium text-[rgb(70,70,70)] dark:text-[rgb(200,200,200)] mb-3">
                    Password Requirements:
                  </h4>
                  <div className="space-y-2">
                    <PasswordRequirement 
                      met={passwordRequirements.minLength} 
                      text="At least 8 characters" 
                    />
                    <PasswordRequirement 
                      met={passwordRequirements.hasUppercase} 
                      text="One uppercase letter (A-Z)" 
                    />
                    <PasswordRequirement 
                      met={passwordRequirements.hasLowercase} 
                      text="One lowercase letter (a-z)" 
                    />
                    <PasswordRequirement 
                      met={passwordRequirements.hasNumber} 
                      text="One number (0-9)" 
                    />
                    <PasswordRequirement 
                      met={passwordRequirements.hasSpecialChar} 
                      text="One special character (!@#$%^&*)" 
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || (isSignUp && (!name.trim() || !isPasswordValid || !doPasswordsMatch))}
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
              onClick={() => {
                setIsSignUp(!isSignUp)
                setName('')
                setPassword('')
                setConfirmPassword('')
                setShowPassword(false)
                setShowConfirmPassword(false)
                setShowVerificationBanner(false) // Hide banner when switching
              }}
              className="text-[rgb(191,114,46)] dark:text-[rgb(200,140,90)] hover:text-[rgb(170,95,40)] dark:hover:text-[rgb(180,120,80)] text-sm font-medium transition-colors duration-300 flex items-center justify-center space-x-1"
            >
              {isSignUp && (
                <ArrowLeft className="w-4 h-4" />
              )}
              <span>
                {isSignUp ? 'Back to Sign In' : 'Need an account? Sign up'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper component for password requirements
const PasswordRequirement: React.FC<{ met: boolean; text: string }> = ({ met, text }) => (
  <div className="flex items-center space-x-2">
    {met ? (
      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
    ) : (
      <X className="w-4 h-4 text-red-500 flex-shrink-0" />
    )}
    <span className={`text-xs ${met ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
      {text}
    </span>
  </div>
)
