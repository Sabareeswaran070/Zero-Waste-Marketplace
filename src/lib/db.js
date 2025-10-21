import mongoose from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  // In development you can use a local MongoDB, but keep env in .env.local
  console.warn('MONGODB_URI is not set. API routes that require DB will fail until you configure it.')
}

let cached = global.mongoose

if (!cached) cached = global.mongoose = { conn: null, promise: null }

export async function connectDB() {
  if (cached.conn) return cached.conn
  if (!MONGODB_URI) return
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}
