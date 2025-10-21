import '../styles/globals.css'
import Navbar from '../components/Navbar'
import { AuthProvider } from '../contexts/AuthContext'
import { NotificationProvider } from '../contexts/NotificationContext'

export const metadata = {
  title: 'Zero-Waste Marketplace',
  description: 'Local platform to swap or sell leftover materials and reduce waste'
}

function ClientLayout({ children }) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <Navbar />
        <main>{children}</main>
        <footer className="bg-gray-800 text-white text-center py-8 mt-16">
          <div className="container">
            <p>&copy; 2025 Zero-Waste Marketplace. Making the world more sustainable.</p>
            <p className="text-sm text-gray-300 mt-2">
              Building a circular economy, one exchange at a time 🌱
            </p>
          </div>
        </footer>
      </AuthProvider>
    </NotificationProvider>
  )
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
