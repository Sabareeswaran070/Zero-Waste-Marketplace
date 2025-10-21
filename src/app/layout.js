// import './globals.css'
import '../styles/globals.css'

import Navbar from '../components/Navbar'

export const metadata = {
  title: 'Zero-Waste Marketplace',
  description: 'Local platform to swap or sell leftover materials'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main style={{ padding: '1rem' }}>{children}</main>
        <footer style={{ textAlign: 'center', padding: '1rem 0' }}>
          © Zero-Waste Marketplace
        </footer>
      </body>
    </html>
  )
}
