import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'

let socketInstance = null

export function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, { autoConnect: false })
  }
  return socketInstance
}

export function useSocket(events = {}) {
  const { user } = useAuthStore()
  const eventsRef = useRef(events)
  eventsRef.current = events

  useEffect(() => {
    const socket = getSocket()

    if (!socket.connected) {
      socket.connect()
      socket.on('connect', () => {
        if (user?.role) {
          socket.emit('join', { role: user.role })
        }
      })
    } else if (user?.role) {
      socket.emit('join', { role: user.role })
    }

    const handlers = Object.entries(eventsRef.current)
    handlers.forEach(([event, handler]) => {
      socket.on(event, handler)
    })

    return () => {
      handlers.forEach(([event, handler]) => {
        socket.off(event, handler)
      })
    }
  }, [user])
}
