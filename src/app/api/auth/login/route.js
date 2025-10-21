import { connectDB } from '../../../../lib/db'
import User from '../../../../models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { 
  createApiHandler, 
  ApiResponse, 
  ValidationError, 
  AuthenticationError,
  sanitizeObject,
  validateRequired,
  jsonResponse,
  jsonError,
  withRetry
} from '../../../../utils/apiHelpers'

const secret = process.env.JWT_SECRET || 'secret'

async function loginHandler(request) {
  const body = await request.json()
  const sanitizedBody = sanitizeObject(body)
  
  // Validate required fields
  validateRequired(sanitizedBody, ['email', 'password'])
  
  const { email, password } = sanitizedBody
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format', {
      email: 'Please enter a valid email address'
    })
  }
  
  // Connect to database with retry logic
  await withRetry(() => connectDB())
  
  // Find user
  const user = await User.findOne({ 
    email: email.toLowerCase().trim() 
  }).select('+password')
  
  if (!user) {
    throw new AuthenticationError('Invalid email or password')
  }
  
  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    throw new AuthenticationError('Invalid email or password')
  }
  
  // Generate JWT token
  const tokenPayload = {
    id: user._id.toString(),
    email: user.email
  }
  
  const token = jwt.sign(tokenPayload, secret, { 
    expiresIn: '7d',
    issuer: 'zero-waste-marketplace',
    audience: 'zero-waste-users'
  })
  
  // Prepare user data (exclude sensitive information)
  const userData = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    isVerified: user.isVerified,
    createdAt: user.createdAt
  }
  
  return jsonResponse({
    token,
    user: userData,
    expiresIn: '7d'
  }, 200)
}

export const POST = createApiHandler(loginHandler)
