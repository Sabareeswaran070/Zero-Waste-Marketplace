import { connectDB } from '../../../lib/db'
import Item from '../../../models/Item'
import { verifyToken } from '../../../utils/verifyToken'

export async function GET() {
  try {
    await connectDB()
    const items = await Item.find()
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .lean()
    return new Response(JSON.stringify(items), { status: 200 })
  } catch (error) {
    console.error('Error fetching items:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
    }

    const body = await request.json()
    await connectDB()
    
    const itemData = {
      ...body,
      owner: decoded.id
    }
    
    const newItem = await Item.create(itemData)
    const populatedItem = await Item.findById(newItem._id).populate('owner', 'name email')
    
    return new Response(JSON.stringify(populatedItem), { status: 201 })
  } catch (error) {
    console.error('Error creating item:', error)
    return new Response(JSON.stringify({ error: 'Failed to create item' }), { status: 500 })
  }
}
