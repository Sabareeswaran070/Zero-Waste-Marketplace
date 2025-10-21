// API Response standardization
export class ApiResponse {
  constructor(success, data = null, error = null, message = null) {
    this.success = success
    this.data = data
    this.error = error
    this.message = message
    this.timestamp = new Date().toISOString()
  }

  static success(data, message = null) {
    return new ApiResponse(true, data, null, message)
  }

  static error(error, message = null) {
    return new ApiResponse(false, null, error, message)
  }
}

// API Error classes
export class ApiError extends Error {
  constructor(message, status = 500, code = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export class ValidationError extends ApiError {
  constructor(message, errors = {}) {
    super(message, 400, 'VALIDATION_ERROR')
    this.errors = errors
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR')
  }
}

// Rate limiting helper
const rateLimiter = new Map()

export function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  if (!rateLimiter.has(identifier)) {
    rateLimiter.set(identifier, [])
  }
  
  const requests = rateLimiter.get(identifier)
  
  // Remove old requests outside the window
  const validRequests = requests.filter(timestamp => timestamp > windowStart)
  
  if (validRequests.length >= maxRequests) {
    throw new ApiError('Rate limit exceeded', 429, 'RATE_LIMIT_ERROR')
  }
  
  validRequests.push(now)
  rateLimiter.set(identifier, validRequests)
}

// Input sanitization
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .slice(0, 10000) // Limit length
}

export function sanitizeObject(obj) {
  const sanitized = {}
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }
  return sanitized
}

// API Handler wrapper
export function createApiHandler(handler) {
  return async (request, context) => {
    const startTime = Date.now()
    
    try {
      // Add request ID for tracking
      const requestId = Math.random().toString(36).substring(2, 15)
      
      // Log request (in production, use proper logging)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${requestId}] ${request.method} ${request.url}`)
      }
      
      // Basic rate limiting (in production, use Redis or similar)
      const ip = request.headers.get('x-forwarded-for') || 'unknown'
      checkRateLimit(ip, 100, 60000) // 100 requests per minute
      
      const result = await handler(request, context)
      
      // Log successful response
      if (process.env.NODE_ENV === 'development') {
        const duration = Date.now() - startTime
        console.log(`[${requestId}] Success (${duration}ms)`)
      }
      
      return result
      
    } catch (error) {
      // Log error
      const duration = Date.now() - startTime
      console.error(`API Error (${duration}ms):`, error)
      
      // Handle different error types
      if (error instanceof ApiError) {
        return new Response(
          JSON.stringify(ApiResponse.error({
            code: error.code,
            message: error.message,
            ...(error instanceof ValidationError && { errors: error.errors })
          })),
          { 
            status: error.status,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      
      // Handle unexpected errors
      const isProduction = process.env.NODE_ENV === 'production'
      return new Response(
        JSON.stringify(ApiResponse.error({
          code: 'INTERNAL_ERROR',
          message: isProduction ? 'Internal server error' : error.message
        })),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  }
}

// Database connection with retry logic
export async function withRetry(operation, maxRetries = 3, delay = 1000) {
  let lastError
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (i === maxRetries) break
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, i)
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }
  
  throw lastError
}

// Validation helper
export function validateRequired(data, requiredFields) {
  const missing = []
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      missing.push(field)
    }
  }
  
  if (missing.length > 0) {
    throw new ValidationError(
      'Missing required fields',
      missing.reduce((acc, field) => {
        acc[field] = 'This field is required'
        return acc
      }, {})
    )
  }
}

// JSON response helpers
export function jsonResponse(data, status = 200) {
  return new Response(
    JSON.stringify(ApiResponse.success(data)),
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

export function jsonError(error, status = 400) {
  return new Response(
    JSON.stringify(ApiResponse.error(error)),
    { 
      status,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}