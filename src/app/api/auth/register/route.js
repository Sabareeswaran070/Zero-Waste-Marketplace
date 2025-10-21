import { connectDB } from '../../../../lib/db'
import User from '../../../../models/User'
import bcrypt from 'bcryptjs'
import { 
  createApiHandler, 
  ApiResponse, 
  ValidationError, 
  ApiError,
  sanitizeObject,
  validateRequired,
  jsonResponse,
  jsonError,
  withRetry
} from '../../../../utils/apiHelpers'

// Password validation helper
function validatePassword(password) {
  const errors = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  return errors
}

async function registerHandler(request) {
  const body = await request.json()
  const sanitizedBody = sanitizeObject(body)
  
  // Validate required fields
  validateRequired(sanitizedBody, ['name', 'email', 'password'])
  
  const { name, email, password } = sanitizedBody
  
  // Validation object for detailed errors
  const validationErrors = {}
  
  // Name validation
  if (name.length < 2) {
    validationErrors.name = 'Name must be at least 2 characters long'
  } else if (name.length > 50) {
    validationErrors.name = 'Name must be less than 50 characters'
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    validationErrors.email = 'Please enter a valid email address'
  }
  
  // Password validation
  const passwordErrors = validatePassword(password)
  if (passwordErrors.length > 0) {
    validationErrors.password = passwordErrors[0] // Show first error
  }
  
  // If there are validation errors, throw them
  if (Object.keys(validationErrors).length > 0) {
    throw new ValidationError('Please fix the following errors:', validationErrors)
  }
  
  // Connect to database with retry logic
  await withRetry(() => connectDB())
  
  // Check if user already exists
  const existingUser = await User.findOne({ 
    email: email.toLowerCase().trim() 
  })
  
  if (existingUser) {
    throw new ApiError('An account with this email already exists', 409, 'USER_EXISTS')
  }
  
  try {
    // Hash password
    const saltRounds = 12 // Increased from 8 for better security
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    
    // Create user
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isVerified: false,
      rating: 0,
      totalTransactions: 0
    }
    
    const user = await User.create(userData)
    
    // Return success response (exclude password)
    const responseData = {
      id: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }
    
    return jsonResponse(responseData, 201)
    
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      throw new ApiError('An account with this email already exists', 409, 'USER_EXISTS')
    }
    
    // Handle other MongoDB errors
    if (error.name === 'ValidationError') {
      const mongoErrors = {}
      Object.keys(error.errors).forEach(key => {
        mongoErrors[key] = error.errors[key].message
      })
      throw new ValidationError('Validation failed', mongoErrors)
    }
    
    throw error
  }
}

export const POST = createApiHandler(registerHandler)
