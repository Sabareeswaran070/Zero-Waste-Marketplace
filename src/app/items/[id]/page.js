'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../../contexts/AuthContext'

export default function ItemDetailPage() {
  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (id) {
      fetchItem()
    }
  }, [id])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/items/${id}`)
      if (response.ok) {
        const data = await response.json()
        setItem(data)
      } else {
        setError('Item not found')
      }
    } catch (error) {
      setError('Error loading item')
      console.error('Error fetching item:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContact = () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    // For now, show an alert. In a real app, this would open a messaging system
    alert(`Contact seller: ${item.owner?.email || 'Contact information not available'}`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        router.push('/items')
      } else {
        alert('Error deleting item')
      }
    } catch (error) {
      alert('Error deleting item')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="loading"></div>
          <span className="ml-2">Loading item...</span>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            {error || 'Item not found'}
          </h2>
          <Link href="/items" className="btn btn-primary">
            Back to Items
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === item.owner?._id

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/items" className="text-primary hover:underline">
          ← Back to Items
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image */}
        <div>
          {item.imageUrl ? (
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-96 object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-6xl mb-2">📦</div>
                <p>No image available</p>
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">{item.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {item.category && (
                <span className="px-4 py-2 bg-primary text-white rounded-full">
                  {item.category}
                </span>
              )}
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full">
                📍 {item.location || 'Location not specified'}
              </span>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full">
                ✅ {item.status || 'Available'}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {item.description || 'No description provided'}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Posted:</span>
                <span className="ml-2 font-medium">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Updated:</span>
                <span className="ml-2 font-medium">
                  {new Date(item.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isOwner ? (
              <>
                <Link 
                  href={`/items/${item._id}/edit`} 
                  className="btn btn-secondary flex-1"
                >
                  ✏️ Edit Item
                </Link>
                <button 
                  onClick={handleDelete}
                  className="btn bg-red-500 text-white hover:bg-red-600 flex-1"
                >
                  🗑️ Delete Item
                </button>
              </>
            ) : (
              <button 
                onClick={handleContact}
                className="btn btn-primary flex-1 text-lg"
              >
                💬 Contact Seller
              </button>
            )}
          </div>

          {!isAuthenticated && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <Link href="/auth/login" className="font-semibold hover:underline">
                  Sign in
                </Link> to contact the seller and make offers.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Seller Info */}
      {item.owner && (
        <div className="mt-12 bg-gray-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold mb-4">About the Seller</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-lg">
              {item.owner.name?.charAt(0).toUpperCase() || item.owner.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{item.owner.name || 'Anonymous User'}</p>
              <p className="text-gray-600 text-sm">
                Member since {new Date(item.owner.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}