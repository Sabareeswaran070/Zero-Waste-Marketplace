import mongoose from 'mongoose'

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  location: String,
  imageUrl: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'available' }
}, { timestamps: true })

export default mongoose.models.Item || mongoose.model('Item', ItemSchema)
