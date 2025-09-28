'use client'

import { useState, useEffect, useCallback } from 'react'

interface DepositPollingOptions {
  userId: string
  enabled?: boolean
  interval?: number // in milliseconds
  onDepositConfirmed?: (deposit: any) => void
}

export function useDepositPolling({
  userId,
  enabled = true,
  interval = 30000, // 30 seconds default
  onDepositConfirmed
}: DepositPollingOptions) {
  const [isPolling, setIsPolling] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const checkDeposits = useCallback(async () => {
    if (!enabled || !userId) return

    try {
      setIsPolling(true)
      setError(null)

      // Check deposit status with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch(`/api/deposits/status?userId=${userId}`, {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.deposits) {
        // Check for newly confirmed deposits
        const confirmedDeposits = data.deposits.filter(
          (deposit: any) => deposit.status === 'confirmed'
        )

        // Notify about confirmed deposits
        confirmedDeposits.forEach((deposit: any) => {
          if (onDepositConfirmed) {
            onDepositConfirmed(deposit)
          }
        })
      }

      setLastCheck(new Date())
    } catch (err) {
      console.error('Error checking deposits:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      // Disable polling on error to prevent infinite loops
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timeout - polling disabled')
      }
    } finally {
      setIsPolling(false)
    }
  }, [userId, enabled, onDepositConfirmed])

  // Manual check function
  const manualCheck = useCallback(() => {
    checkDeposits()
  }, [checkDeposits])

  // Auto-polling effect
  useEffect(() => {
    if (!enabled || !userId) return

    // Initial check
    checkDeposits()

    // Set up interval
    const intervalId = setInterval(checkDeposits, interval)

    return () => clearInterval(intervalId)
  }, [enabled, interval, userId]) // Remove checkDeposits to prevent infinite loops

  return {
    isPolling,
    lastCheck,
    error,
    manualCheck
  }
}
