import { connectDB } from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const secret = process.env.JWT_SECRET || 'secret'

export async function POST(request) {
  const body = await request.json()
  const { email, password } = body
  if (!email || !password) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })
  await connectDB()
  const user = await User.findOne({ email })
  if (!user) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 })
  const token = jwt.sign({ id: user._id, email: user.email }, secret, { expiresIn: '7d' })
  return new Response(JSON.stringify({ token }), { status: 200 })
}
