'use client'
import { createContext, useContext, useState, useCallback } from 'react'

const NotificationContext = createContext({})

// Notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
}

let notificationId = 0

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])

  const addNotification = useCallback((message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
    const id = ++notificationId
    const notification = {
      id,
      message,
      type,
      timestamp: Date.now()
    }

    setNotifications(prev => [...prev, notification])

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }

    return id
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  // Convenience methods
  const success = useCallback((message, duration) => 
    addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration), [addNotification])
  
  const error = useCallback((message, duration = 8000) => 
    addNotification(message, NOTIFICATION_TYPES.ERROR, duration), [addNotification])
  
  const warning = useCallback((message, duration) => 
    addNotification(message, NOTIFICATION_TYPES.WARNING, duration), [addNotification])
  
  const info = useCallback((message, duration) => 
    addNotification(message, NOTIFICATION_TYPES.INFO, duration), [addNotification])

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
    </NotificationContext.Provider>
  )
}

function NotificationContainer({ notifications, onRemove }) {
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

function NotificationItem({ notification, onRemove }) {
  const { id, message, type } = notification

  const getIcon = () => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return '✅'
      case NOTIFICATION_TYPES.ERROR:
        return '❌'
      case NOTIFICATION_TYPES.WARNING:
        return '⚠️'
      case NOTIFICATION_TYPES.INFO:
        return 'ℹ️'
      default:
        return 'ℹ️'
    }
  }

  const getStyles = () => {
    const baseStyles = 'min-w-80 max-w-md p-4 rounded-lg shadow-lg border-l-4 bg-white transform transition-all duration-300 hover:scale-105'
    
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return `${baseStyles} border-green-500`
      case NOTIFICATION_TYPES.ERROR:
        return `${baseStyles} border-red-500`
      case NOTIFICATION_TYPES.WARNING:
        return `${baseStyles} border-yellow-500`
      case NOTIFICATION_TYPES.INFO:
        return `${baseStyles} border-blue-500`
      default:
        return `${baseStyles} border-gray-500`
    }
  }

  return (
    <div className={`${getStyles()} fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg">{getIcon()}</span>
          <p className="text-gray-800 text-sm leading-relaxed">{message}</p>
        </div>
        <button
          onClick={() => onRemove(id)}
          className="text-gray-400 hover:text-gray-600 ml-2"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}