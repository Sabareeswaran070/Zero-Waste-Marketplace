'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../contexts/AuthContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { useLoginForm } from '../../../hooks/useFormValidation'

export default function LoginPage() {
  const { login, isAuthenticated, loading: authLoading, error: authError } = useAuth()
  const { success, error: notify } = useNotifications()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const {
    data,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError
  } = useLoginForm()

  // Show success message if redirected from registration
  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      success(message)
    }
  }, [searchParams, success])

  // Show auth errors as notifications
  useEffect(() => {
    if (authError) {
      notify(authError)
    }
  }, [authError, notify])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirectTo = searchParams.get('redirectTo') || '/'
      router.push(redirectTo)
    }
  }, [isAuthenticated, authLoading, router, searchParams])

  const onSubmit = async (formData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        const loginSuccess = await login(result.data.token, result.data.user)
        
        if (loginSuccess) {
          success('Welcome back! You have been successfully logged in.')
          const redirectTo = searchParams.get('redirectTo') || '/'
          router.push(redirectTo)
          return true
        } else {
          setFieldError('general', 'Login failed. Please try again.')
          return false
        }
      } else {
        // Handle API errors
        if (result.error && typeof result.error === 'object' && result.error.errors) {
          // Validation errors
          Object.entries(result.error.errors).forEach(([field, message]) => {
            setFieldError(field, message)
          })
        } else {
          setFieldError('general', result.error?.message || result.message || 'Login failed')
        }
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      setFieldError('general', 'Network error. Please check your connection and try again.')
      return false
    }
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: 'calc(100vh - 120px)'
      }}>
        <div className="card w-full max-w-md fade-in">
          <div className="card-body text-center">
            <div className="loading mb-4"></div>
            <p className="text-gray-600">Checking authentication status...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: 'calc(100vh - 120px)'
    }}>
      <div className="card w-full max-w-md fade-in">
        <div className="card-body">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to your Zero Waste account</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(onSubmit)
          }}>
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your email"
                className={errors.email && touched.email ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.email && touched.email && <p className="form-error">{errors.email}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={data.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                className={errors.password && touched.password ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.password && touched.password && <p className="form-error">{errors.password}</p>}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full mb-4"
              disabled={isSubmitting || !data.email || !data.password}
            >
              {isSubmitting ? (
                <>
                  <span className="loading"></span>
                  Signing in...
                </>
              ) : (
                '🔑 Sign In'
              )}
            </button>
          </form>

          <div className="text-center space-y-3">
            <div>
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-primary hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link 
                  href="/auth/register" 
                  className="text-primary font-semibold hover:underline"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}