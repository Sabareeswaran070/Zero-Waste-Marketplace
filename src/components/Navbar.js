import Link from 'next/link'

export default function Navbar() {
  return (
    <nav style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid #eee'}}>
      <div>
        <Link href="/"><strong>Zero-Waste</strong></Link>
      </div>
      <div style={{display: 'flex', gap: '0.75rem'}}>
        <Link href="/items">Items</Link>
        <Link href="/add-item">Add Item</Link>
      </div>
    </nav>
  )
}
