// envtest.js
import dotenv from 'dotenv';

// Load .env.local variables
dotenv.config({ path: '.env.local' });

// Print out your environment variables
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("JWT_SECRET:", process.env.JWT_SECRET);
console.log("CLOUDINARY_URL:", process.env.CLOUDINARY_URL);

// Optional: test connecting to MongoDB
import mongoose from 'mongoose';

const testDBConnection = async () => {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set!");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB Atlas");
    await mongoose.disconnect();
  } catch (err) {
    console.error("❌ Connection failed:", err.message);
  }
};

testDBConnection();
