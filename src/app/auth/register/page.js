'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../contexts/AuthContext'
import { useNotifications } from '../../../contexts/NotificationContext'
import { useRegisterForm, calculatePasswordStrength } from '../../../hooks/useFormValidation'

export default function RegisterPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { success, error: notify } = useNotifications()
  const router = useRouter()
  
  const {
    data,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError
  } = useRegisterForm()

  // Calculate password strength using the imported function
  const passwordStrength = calculatePasswordStrength(data.password)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])

  const onSubmit = async (formData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        success('Account created successfully! Please sign in to continue.')
        router.push('/auth/login?message=Registration successful! Please sign in.')
        return true
      } else {
        // Handle API errors
        if (result.error && typeof result.error === 'object' && result.error.errors) {
          // Validation errors
          Object.entries(result.error.errors).forEach(([field, message]) => {
            setFieldError(field, message)
          })
        } else {
          setFieldError('general', result.error?.message || result.message || 'Registration failed')
        }
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      setFieldError('general', 'Network error. Please check your connection and try again.')
      return false
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength.score <= 2) return '#ef4444'
    if (passwordStrength.score <= 3) return '#f59e0b'
    return '#10b981'
  }

  const getStrengthText = () => {
    if (passwordStrength.score <= 1) return 'Weak'
    if (passwordStrength.score <= 2) return 'Fair'
    if (passwordStrength.score <= 3) return 'Good'
    return 'Strong'
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
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Zero Waste</h1>
            <p className="text-gray-600">Create your account to start trading</p>
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
              <label htmlFor="name" className="form-label">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={data.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                className={errors.name && touched.name ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.name && touched.name && <p className="form-error">{errors.name}</p>}
            </div>

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
                placeholder="Create a secure password"
                className={errors.password && touched.password ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {data.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-200 rounded">
                      <div 
                        className="h-full rounded transition-all duration-300"
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: getStrengthColor()
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium" style={{ color: getStrengthColor() }}>
                      {getStrengthText()}
                    </span>
                  </div>
                  {passwordStrength.feedback.length > 0 && (
                    <div className="mt-1">
                      <p className="text-xs text-gray-600">
                        Suggestions: {passwordStrength.feedback.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              )}
              {errors.password && touched.password && <p className="form-error">{errors.password}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={data.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Confirm your password"
                className={errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="form-error">{errors.confirmPassword}</p>
              )}
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-xs leading-relaxed">
                By creating an account, you agree to help build a sustainable community by 
                sharing resources responsibly and treating all members with respect.
              </p>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full mb-4"
              disabled={isSubmitting || !data.name || !data.email || !data.password || !data.confirmPassword}
            >
              {isSubmitting ? (
                <>
                  <span className="loading"></span>
                  Creating account...
                </>
              ) : (
                '🌱 Create Account'
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <Link 
                href="/auth/login" 
                className="text-primary font-semibold hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}