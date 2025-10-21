import { connectDB } from '@/lib/db'
import User from '@/models/User'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  const body = await request.json()
  const { name, email, password } = body
  if (!email || !password) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 })
  await connectDB()
  const exists = await User.findOne({ email })
  if (exists) return new Response(JSON.stringify({ error: 'User exists' }), { status: 409 })
  const hashed = await bcrypt.hash(password, 8)
  const user = await User.create({ name, email, password: hashed })
  return new Response(JSON.stringify({ id: user._id, email: user.email }), { status: 201 })
}
