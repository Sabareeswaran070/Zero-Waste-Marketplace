'use client'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'

export default function Home() {
  const { isAuthenticated } = useAuth()

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="relative py-20 px-4 text-center text-white"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '500px',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <div className="container mx-auto">
          <div className="fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              🌱 Zero-Waste Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Transform waste into opportunity. Connect with your community to swap, 
              donate, or sell items that would otherwise go to landfill.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/items" className="btn btn-primary btn-lg">
                🔍 Browse Items
              </Link>
              {isAuthenticated ? (
                <Link href="/add-item" className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary">
                  ➕ List an Item
                </Link>
              ) : (
                <Link href="/auth/register" className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-primary">
                  🚀 Get Started
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose Zero-Waste?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of eco-conscious individuals making a difference in their communities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center hover:shadow-xl transition-all">
              <div className="card-body">
                <div className="text-5xl mb-4">🌍</div>
                <h3 className="text-2xl font-semibold mb-4">Reduce Environmental Impact</h3>
                <p className="text-gray-600">
                  Every item shared prevents waste from reaching landfills and reduces carbon footprint
                </p>
              </div>
            </div>
            
            <div className="card text-center hover:shadow-xl transition-all">
              <div className="card-body">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-2xl font-semibold mb-4">Build Community</h3>
                <p className="text-gray-600">
                  Connect with neighbors and local businesses to create a circular economy
                </p>
              </div>
            </div>
            
            <div className="card text-center hover:shadow-xl transition-all">
              <div className="card-body">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-2xl font-semibold mb-4">Save Money</h3>
                <p className="text-gray-600">
                  Find great deals on quality items or earn money from things you no longer need
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Getting started is simple and free
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
              <p className="text-gray-600">Create your free account in seconds</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">List Items</h3>
              <p className="text-gray-600">Upload photos and describe items you want to share</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">Browse and connect with interested community members</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2">Exchange</h3>
              <p className="text-gray-600">Meet safely and complete your eco-friendly exchange</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join our growing community of environmental champions today
          </p>
          {!isAuthenticated && (
            <Link href="/auth/register" className="btn btn-lg bg-white text-primary hover:bg-gray-100">
              Start Your Zero-Waste Journey
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
