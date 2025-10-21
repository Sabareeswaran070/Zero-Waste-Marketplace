'use client'
import { useEffect, useState } from 'react'

export default function ItemsPage() {
  const [items, setItems] = useState([])

  useEffect(() => {
    fetch('/api/items').then(r => r.json()).then(setItems).catch(console.error)
  }, [])

  return (
    <div>
      <h2>Available Items</h2>
      {items.length === 0 && <p>No items yet — add one!</p>}
      <div style={{display: 'grid', gap: '1rem', marginTop: '1rem'}}>
        {items.map(item => (
          <div key={item._id} style={{border: '1px solid #ddd', padding: '0.75rem', borderRadius: 6}}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <small>{item.category} • {item.location}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
