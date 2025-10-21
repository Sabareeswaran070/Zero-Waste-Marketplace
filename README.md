# 🌱 Zero-Waste Marketplace

A modern, full-stack marketplace application built with Next.js that enables communities to reduce waste by facilitating the exchange, donation, and sale of items that would otherwise be discarded.

## ✨ Features

### 🔐 Authentication & User Management
- **Secure user registration and login** with JWT authentication
- **User profiles** with detailed information and edit capabilities
- **Password strength validation** and secure hashing
- **Protected routes** and middleware

### 📦 Item Management
- **Add items** with rich descriptions, categories, and images
- **Browse and search** items with advanced filtering
- **Item detail pages** with full information and seller contact
- **Edit and manage** your own items
- **Status tracking** (Available, Pending, Sold/Traded, Withdrawn)

### 🎨 Modern UI/UX
- **Responsive design** that works on all devices
- **Beautiful animations** and smooth transitions
- **Professional styling** with modern CSS
- **Intuitive navigation** and user experience

### 🌐 Core Functionality
- **Real-time item listings** with MongoDB integration
- **Image upload support** (ready for Cloudinary integration)
- **Location-based** item filtering
- **Category organization** with predefined categories
- **User dashboard** to manage personal items

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, Modern CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcryptjs
- **Styling**: Custom CSS with modern design system
- **File Upload**: Ready for Cloudinary integration

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** (version 16 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** for version control

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Sabareeswaran070/Zero-Waste-Marketplace.git
cd zero-waste-marketplace
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Update the `.env.local` file with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/zero-waste-marketplace
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/zero-waste-marketplace

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Cloudinary (optional, for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key  
CLOUDINARY_API_SECRET=your-api-secret

# Application
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run the Application

#### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎯 Usage Guide

### Getting Started

1. **Sign Up**: Create a new account or sign in if you already have one
2. **Browse Items**: Explore items shared by the community
3. **Add Items**: List items you want to share, sell, or donate
4. **Connect**: Contact sellers/donors through the platform
5. **Manage**: Keep track of your items and update their status

### Key Pages

- **Homepage** (`/`): Beautiful landing page with features and call-to-action
- **Browse Items** (`/items`): Search and filter through all available items
- **Item Details** (`/items/[id]`): Detailed view of individual items
- **Add Item** (`/add-item`): Form to list new items
- **My Items** (`/my-items`): Dashboard to manage your listings
- **Profile** (`/profile`): User profile with edit capabilities
- **Login/Register** (`/auth/login`, `/auth/register`): Authentication pages

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Items
- `GET /api/items` - Get all items
- `POST /api/items` - Create new item (protected)
- `GET /api/items/[id]` - Get item by ID
- `PUT /api/items/[id]` - Update item (protected, owner only)
- `DELETE /api/items/[id]` - Delete item (protected, owner only)

### User
- `GET /api/user/profile` - Get user profile (protected)
- `PUT /api/user/profile` - Update user profile (protected)
- `GET /api/user/items` - Get user's items (protected)

## 🚀 Deployment

The app can be deployed on platforms like Vercel, Netlify, or Railway. Make sure to set your environment variables in the deployment platform.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes and commit
4. Submit a pull request

---

**Made with 🌱 for a sustainable future**

## Quick start

1. Copy `.env.local.example` to `.env.local` and fill values.
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open `http://localhost:3000`

Note: API routes use Next.js route handlers and require Node.js environment. The provided code is minimal and intended as a starting point — extend auth, validation, and production readiness as needed.
