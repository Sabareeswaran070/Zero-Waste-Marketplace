import { connectDB } from '../../../../lib/db'
import Item from '../../../../models/Item'
import User from '../../../../models/User'
import { verifyToken } from '../../../../utils/verifyToken'

export async function GET(request, { params }) {
  try {
    await connectDB()
    const item = await Item.findById(params.id).populate('owner', 'name email createdAt').lean()
    
    if (!item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404 })
    }
    
    return new Response(JSON.stringify(item), { status: 200 })
  } catch (error) {
    console.error('Error fetching item:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

export async function PUT(request, { params }) {
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
    const item = await Item.findById(params.id)
    
    if (!item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404 })
    }

    // Check if user owns the item
    if (item.owner.toString() !== decoded.id) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403 })
    }

    const body = await request.json()
    const updatedItem = await Item.findByIdAndUpdate(params.id, body, { new: true })
    
    return new Response(JSON.stringify(updatedItem), { status: 200 })
  } catch (error) {
    console.error('Error updating item:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

export async function DELETE(request, { params }) {
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
    const item = await Item.findById(params.id)
    
    if (!item) {
      return new Response(JSON.stringify({ error: 'Item not found' }), { status: 404 })
    }

    // Check if user owns the item
    if (item.owner.toString() !== decoded.id) {
      return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403 })
    }

    await Item.findByIdAndDelete(params.id)
    
    return new Response(JSON.stringify({ message: 'Item deleted successfully' }), { status: 200 })
  } catch (error) {
    console.error('Error deleting item:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}