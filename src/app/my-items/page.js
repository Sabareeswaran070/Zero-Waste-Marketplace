'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function MyItemsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchMyItems()
  }, [isAuthenticated])

  const fetchMyItems = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/items', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setItems(items.filter(item => item._id !== itemId))
      } else {
        alert('Error deleting item')
      }
    } catch (error) {
      alert('Error deleting item')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="loading"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="loading"></div>
          <p>Loading your items...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Items</h1>
          <p className="text-gray-600">Manage your listed items</p>
        </div>
        <Link href="/add-item" className="btn btn-primary">
          ➕ Add New Item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">
            No items yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first item to the marketplace
          </p>
          <Link href="/add-item" className="btn btn-primary">
            Add Your First Item
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-gray-600">
              You have {items.length} item{items.length !== 1 ? 's' : ''} listed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item._id} className="card hover:shadow-lg transition-all">
                {item.imageUrl && (
                  <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="card-body">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{item.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.category && (
                      <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
                        {item.category}
                      </span>
                    )}
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      📍 {item.location || 'Location not specified'}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${
                      item.status === 'available' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status || 'Available'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">
                      Posted {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link 
                      href={`/items/${item._id}`} 
                      className="btn btn-outline btn-sm flex-1"
                    >
                      👁️ View
                    </Link>
                    <Link 
                      href={`/items/${item._id}/edit`} 
                      className="btn btn-secondary btn-sm flex-1"
                    >
                      ✏️ Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(item._id)}
                      className="btn bg-red-500 text-white hover:bg-red-600 btn-sm flex-1"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}