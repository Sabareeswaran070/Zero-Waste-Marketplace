export async function fetchItems() {
  const res = await fetch('/api/items')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}
