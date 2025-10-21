'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India'
    }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    fetchProfile()
  }, [isAuthenticated])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          bio: data.bio || '',
          address: {
            street: data.address?.street || '',
            city: data.address?.city || '',
            state: data.address?.state || '',
            zipCode: data.address?.zipCode || '',
            country: data.address?.country || 'India'
          }
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setEditing(false)
      } else {
        alert('Error updating profile')
      }
    } catch (error) {
      alert('Error updating profile')
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      bio: profile?.bio || '',
      address: {
        street: profile?.address?.street || '',
        city: profile?.address?.city || '',
        state: profile?.address?.state || '',
        zipCode: profile?.address?.zipCode || '',
        country: profile?.address?.country || 'India'
      }
    })
    setEditing(false)
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
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Profile</h1>
          {!editing && (
            <button 
              onClick={() => setEditing(true)}
              className="btn btn-primary"
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <div className="card">
              <div className="card-body text-center">
                <div className="w-24 h-24 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                  {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-2xl font-semibold mb-2">{profile?.name || 'Anonymous User'}</h2>
                <p className="text-gray-600 mb-4">{profile?.email}</p>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{profile?.totalTransactions || 0}</div>
                    <div className="text-sm text-gray-600">Transactions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {profile?.rating ? profile.rating.toFixed(1) : '0.0'}
                    </div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Member since {new Date(profile?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-body">
                {editing ? (
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Edit Profile</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="phone" className="form-label">Phone Number</label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="Your phone number"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="bio" className="form-label">Bio</label>
                      <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        rows="3"
                      />
                    </div>

                    <h4 className="text-lg font-semibold mb-4 mt-6">Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="form-group md:col-span-2">
                        <label htmlFor="address.street" className="form-label">Street Address</label>
                        <input
                          type="text"
                          id="address.street"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleChange}
                          placeholder="Street address"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="address.city" className="form-label">City</label>
                        <input
                          type="text"
                          id="address.city"
                          name="address.city"
                          value={formData.address.city}
                          onChange={handleChange}
                          placeholder="City"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="address.state" className="form-label">State</label>
                        <input
                          type="text"
                          id="address.state"
                          name="address.state"
                          value={formData.address.state}
                          onChange={handleChange}
                          placeholder="State"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="address.zipCode" className="form-label">Zip Code</label>
                        <input
                          type="text"
                          id="address.zipCode"
                          name="address.zipCode"
                          value={formData.address.zipCode}
                          onChange={handleChange}
                          placeholder="Zip code"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="address.country" className="form-label">Country</label>
                        <input
                          type="text"
                          id="address.country"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleChange}
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary"
                      >
                        {saving ? (
                          <>
                            <span className="loading"></span>
                            Saving...
                          </>
                        ) : (
                          '💾 Save Changes'
                        )}
                      </button>
                      <button 
                        onClick={handleCancel}
                        className="btn btn-outline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-semibold mb-6">Profile Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="form-label">Full Name</label>
                        <p className="text-gray-800">{profile?.name || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <label className="form-label">Email</label>
                        <p className="text-gray-800">{profile?.email}</p>
                      </div>
                      
                      <div>
                        <label className="form-label">Phone</label>
                        <p className="text-gray-800">{profile?.phone || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <label className="form-label">Member Since</label>
                        <p className="text-gray-800">{new Date(profile?.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {profile?.bio && (
                      <div className="mt-6">
                        <label className="form-label">Bio</label>
                        <p className="text-gray-800">{profile.bio}</p>
                      </div>
                    )}

                    {(profile?.address?.city || profile?.address?.state) && (
                      <div className="mt-6">
                        <label className="form-label">Location</label>
                        <p className="text-gray-800">
                          {[profile.address?.street, profile.address?.city, profile.address?.state, profile.address?.zipCode, profile.address?.country]
                            .filter(Boolean)
                            .join(', ') || 'Not provided'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}