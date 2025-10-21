import jwt from 'jsonwebtoken'
const secret = process.env.JWT_SECRET || 'secret'

export function verifyToken(token) {
  try {
    return jwt.verify(token, secret)
  } catch (err) {
    return null
  }
}
