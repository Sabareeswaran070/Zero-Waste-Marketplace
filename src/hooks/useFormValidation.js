import { useState, useCallback, useMemo } from 'react'

// Validation rules
export const validationRules = {
  required: (value, message = 'This field is required') => 
    !value || (typeof value === 'string' && !value.trim()) ? message : null,
  
  minLength: (min, message) => (value) => 
    value && value.length < min ? message || `Must be at least ${min} characters` : null,
  
  maxLength: (max, message) => (value) => 
    value && value.length > max ? message || `Must be no more than ${max} characters` : null,
  
  email: (value, message = 'Please enter a valid email address') => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !emailRegex.test(value) ? message : null
  },
  
  password: (value, message = 'Password must be at least 8 characters with uppercase, lowercase, and number') => {
    if (!value) return null
    const hasUpper = /[A-Z]/.test(value)
    const hasLower = /[a-z]/.test(value)
    const hasNumber = /[0-9]/.test(value)
    const hasLength = value.length >= 8
    
    if (!hasLength || !hasUpper || !hasLower || !hasNumber) {
      return message
    }
    return null
  },
  
  confirmPassword: (originalPassword) => (value, message = 'Passwords do not match') => 
    value !== originalPassword ? message : null,
  
  phone: (value, message = 'Please enter a valid phone number') => {
    if (!value) return null
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return !phoneRegex.test(value.replace(/\s/g, '')) ? message : null
  },
  
  url: (value, message = 'Please enter a valid URL') => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return message
    }
  }
}

// Password strength calculator
export const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, feedback: [] }
  
  let score = 0
  const feedback = []
  
  if (password.length >= 8) {
    score++
  } else {
    feedback.push('Use at least 8 characters')
  }
  
  if (/[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Add uppercase letters')
  }
  
  if (/[a-z]/.test(password)) {
    score++
  } else {
    feedback.push('Add lowercase letters')
  }
  
  if (/[0-9]/.test(password)) {
    score++
  } else {
    feedback.push('Add numbers')
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score++
  } else {
    feedback.push('Add special characters')
  }
  
  return { score, feedback }
}

// Main validation hook
export function useFormValidation(initialData = {}, validationSchema = {}) {
  const [data, setData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validate a single field
  const validateField = useCallback((name, value) => {
    const rules = validationSchema[name]
    if (!rules) return null

    for (const rule of rules) {
      const error = rule(value)
      if (error) return error
    }
    return null
  }, [validationSchema])

  // Validate all fields
  const validateAll = useCallback(() => {
    const newErrors = {}
    let isValid = true

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, data[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }, [data, validateField, validationSchema])

  // Handle field change
  const handleChange = useCallback((nameOrEvent, value) => {
    let fieldName, fieldValue

    if (typeof nameOrEvent === 'string') {
      fieldName = nameOrEvent
      fieldValue = value
    } else {
      const event = nameOrEvent
      fieldName = event.target.name
      fieldValue = event.target.type === 'checkbox' 
        ? event.target.checked 
        : event.target.value
    }

    setData(prev => ({ ...prev, [fieldName]: fieldValue }))

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const updated = { ...prev }
        delete updated[fieldName]
        return updated
      })
    }
  }, [errors])

  // Handle field blur
  const handleBlur = useCallback((nameOrEvent) => {
    const fieldName = typeof nameOrEvent === 'string' 
      ? nameOrEvent 
      : nameOrEvent.target.name

    setTouched(prev => ({ ...prev, [fieldName]: true }))

    // Validate field on blur
    const error = validateField(fieldName, data[fieldName])
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }))
    }
  }, [data, validateField])

  // Reset form
  const reset = useCallback((newData = initialData) => {
    setData(newData)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialData])

  // Set field error manually
  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }))
  }, [])

  // Set multiple errors
  const setFieldErrors = useCallback((errorObj) => {
    setErrors(prev => ({ ...prev, ...errorObj }))
  }, [])

  // Submit handler
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true)
    
    try {
      const isValid = validateAll()
      if (!isValid) {
        // Mark all fields as touched to show errors
        setTouched(Object.keys(validationSchema).reduce((acc, key) => {
          acc[key] = true
          return acc
        }, {}))
        return false
      }

      const result = await onSubmit(data)
      return result
    } catch (error) {
      console.error('Form submission error:', error)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [data, validateAll, validationSchema])

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(validationSchema).every(fieldName => 
      !validateField(fieldName, data[fieldName])
    )
  }, [data, validationSchema, validateField])

  // Check if form has been modified
  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initialData)
  }, [data, initialData])

  return {
    data,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateAll,
    reset,
    setFieldError,
    setFieldErrors,
    setData
  }
}

// Hook for specific form types
export function useLoginForm() {
  return useFormValidation(
    { email: '', password: '' },
    {
      email: [validationRules.required, validationRules.email],
      password: [validationRules.required]
    }
  )
}

export function useRegisterForm() {
  const form = useFormValidation(
    { name: '', email: '', password: '', confirmPassword: '' },
    {
      name: [
        validationRules.required,
        validationRules.minLength(2, 'Name must be at least 2 characters')
      ],
      email: [validationRules.required, validationRules.email],
      password: [validationRules.required, validationRules.password],
      confirmPassword: [
        validationRules.required,
        (value) => validationRules.confirmPassword(form.data.password)(value)
      ]
    }
  )
  
  return form
}

export function useItemForm(initialData = {}) {
  return useFormValidation(
    {
      title: '',
      description: '',
      category: '',
      location: '',
      imageUrl: '',
      status: 'available',
      ...initialData
    },
    {
      title: [
        validationRules.required,
        validationRules.minLength(3, 'Title must be at least 3 characters'),
        validationRules.maxLength(100, 'Title must be less than 100 characters')
      ],
      description: [
        validationRules.required,
        validationRules.minLength(10, 'Description must be at least 10 characters'),
        validationRules.maxLength(1000, 'Description must be less than 1000 characters')
      ],
      category: [validationRules.required],
      location: [validationRules.required],
      imageUrl: [
        (value) => value ? validationRules.url(value) : null
      ]
    }
  )
}