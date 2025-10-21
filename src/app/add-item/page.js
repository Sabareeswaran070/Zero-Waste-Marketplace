'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddItemPage() {
  const [form, setForm] = useState({ title: '', description: '', category: '', location: '' })
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      alert('Item added')
      router.push('/items')
    } else {
      alert('Error adding item')
    }
  }

  return (
    <div style={{maxWidth: 600}}>
      <h2>Add New Item</h2>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
        <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
        <input placeholder="Location (city or pincode)" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
