import { connectDB } from '../../../../lib/db'
import Item from '../../../../models/Item'
import { verifyToken } from '../../../../utils/verifyToken'

export async function GET(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
    }

    await connectDB()
    const items = await Item.find({ owner: decoded.id })
      .sort({ createdAt: -1 })
      .lean()
    
    return new Response(JSON.stringify(items), { status: 200 })
  } catch (error) {
    console.error('Error fetching user items:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}