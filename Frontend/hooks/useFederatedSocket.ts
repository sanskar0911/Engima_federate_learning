"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { io, Socket } from "socket.io-client"

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

let sharedSocket: Socket | null = null

function getSharedSocket(): Socket {
  if (!sharedSocket || !sharedSocket.connected) {
    sharedSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })
  }
  return sharedSocket
}

/**
 * Hook to access the shared Socket.IO connection and listen to federated events.
 */
export function useFederatedSocket() {
  const [connected, setConnected] = useState(false)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = getSharedSocket()
    socketRef.current = socket

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    setConnected(socket.connected)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [])

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    const socket = socketRef.current || getSharedSocket()
    socket.on(event, handler)
    return () => {
      socket.off(event, handler)
    }
  }, [])

  const emit = useCallback((event: string, data?: any) => {
    const socket = socketRef.current || getSharedSocket()
    socket.emit(event, data)
  }, [])

  return { socket: socketRef.current, connected, on, emit }
}

/**
 * Hook to collect live federated events and expose them as an ordered list.
 * Caps at `maxEvents` to prevent memory growth.
 */
export function useFederatedEvents(maxEvents = 80) {
  const { on, connected } = useFederatedSocket()
  const [events, setEvents] = useState<any[]>([])

  const addEvent = useCallback((type: string, data: any) => {
    setEvents((prev) => [{ type, ...data, _localTime: new Date().toISOString() }, ...prev].slice(0, maxEvents))
  }, [maxEvents])

  useEffect(() => {
    const offs: Array<() => void> = []

    const EVENTS = [
      "federated:round_started",
      "federated:round_completed",
      "federated:round_failed",
      "federated:round_status_changed",
      "federated:bank_connected",
      "federated:bank_disconnected",
      "federated:bank_training",
      "federated:update_received",
      "federated:all_updates_received",
      "federated:aggregation_started",
      "federated:aggregation_completed",
      "federated:model_created",
      "federated:model_distribution_started",
      "federated:model_received",
      "federated:bank_status_changed",
      "federated:demo_started",
      "federated:demo_completed",
      "federated:demo_timeline_event",
      "federated:demo_reset",
      "federated:error",
      "privacy:transfer_event",
      "new-transaction",
      "new-alert",
    ]

    EVENTS.forEach((evt) => {
      offs.push(on(evt, (data) => addEvent(evt, data)))
    })

    return () => offs.forEach((off) => off())
  }, [on, addEvent])

  return { events, connected }
}
