// import { connectDB } from '@/lib/db'
// import Item from '@/models/Item'
import { connectDB } from '../../../lib/db'
import Item from '../../../models/Item'

export async function GET() {
  await connectDB()
  const items = await Item.find().sort({ createdAt: -1 }).lean()
  return new Response(JSON.stringify(items), { status: 200 })
}

export async function POST(request) {
  try {
    const body = await request.json()
    await connectDB()
    const newItem = await Item.create(body)
    return new Response(JSON.stringify(newItem), { status: 201 })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Failed to create item' }), { status: 500 })
  }
}
