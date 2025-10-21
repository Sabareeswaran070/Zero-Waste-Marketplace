import Link from 'next/link'

export default function Home() {
  return (
    <div>
      <h1>Zero-Waste Marketplace</h1>
      <p>Local platform to swap, donate, or sell leftover items.</p>
      <nav style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
        <Link href="/add-item">Add Item</Link>
        <Link href="/items">View Items</Link>
      </nav>
    </div>
  )
}
