import { connectDB } from '../../../../lib/db'
import User from '../../../../models/User'
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
    const user = await User.findById(decoded.id).select('-password').lean()
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }
    
    return new Response(JSON.stringify(user), { status: 200 })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 })
    }

    const body = await request.json()
    await connectDB()
    
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      {
        name: body.name,
        phone: body.phone,
        bio: body.bio,
        address: body.address
      },
      { new: true, runValidators: true }
    ).select('-password')
    
    if (!updatedUser) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }
    
    return new Response(JSON.stringify(updatedUser), { status: 200 })
  } catch (error) {
    console.error('Error updating profile:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 })
  }
}