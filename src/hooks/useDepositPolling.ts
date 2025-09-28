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

      // Check deposit status
      const response = await fetch(`/api/deposits/status?userId=${userId}`)
      const data = await response.json()

      if (data.success && data.deposits) {
        // Check for newly confirmed deposits
        const confirmedDeposits = data.deposits.filter(
          (deposit: any) => deposit.status === 'confirmed'
        )

        // Trigger manual monitoring for pending deposits
        const pendingDeposits = data.deposits.filter(
          (deposit: any) => deposit.status === 'pending' && deposit.wallet_address
        )

        // For each pending deposit, trigger manual monitoring
        for (const deposit of pendingDeposits) {
          try {
            await fetch('/api/deposits/monitor', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                walletAddress: deposit.wallet_address,
                cryptoType: deposit.crypto_type,
                userId: userId
              })
            })
          } catch (monitorError) {
            console.error('Error monitoring deposit:', monitorError)
          }
        }

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
    if (!enabled) return

    // Initial check
    checkDeposits()

    // Set up interval
    const intervalId = setInterval(checkDeposits, interval)

    return () => clearInterval(intervalId)
  }, [checkDeposits, enabled, interval])

  return {
    isPolling,
    lastCheck,
    error,
    manualCheck
  }
}
