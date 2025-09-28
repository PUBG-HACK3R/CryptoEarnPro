'use client'

import { useState, useEffect } from 'react'
import { useDepositPolling } from '@/hooks/useDepositPolling'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  ExternalLink,
  RefreshCw,
  Wallet
} from 'lucide-react'
import { formatCurrency, formatCrypto, truncateAddress } from '@/lib/utils'

interface DepositStatus {
  id: string
  amount: number
  crypto_type: string
  wallet_address: string
  tx_hash?: string
  status: 'pending' | 'confirmed' | 'failed'
  created_at: string
  blockchain_status?: {
    status: string
    confirmations: number
    requiredConfirmations: number
  }
}

interface AutoDepositTrackerProps {
  userId: string
  onDepositConfirmed?: (deposit: DepositStatus) => void
}

export default function AutoDepositTracker({ userId, onDepositConfirmed }: AutoDepositTrackerProps) {
  const [deposits, setDeposits] = useState<DepositStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Use client-side polling for real-time updates
  const { isPolling, lastCheck, error: pollingError, manualCheck } = useDepositPolling({
    userId,
    enabled: true,
    interval: 30000, // Check every 30 seconds
    onDepositConfirmed: (deposit) => {
      if (onDepositConfirmed) {
        onDepositConfirmed(deposit)
      }
      // Refresh deposits when one is confirmed
      fetchDeposits()
    }
  })

  // Fetch deposits
  const fetchDeposits = async () => {
    try {
      const response = await fetch(`/api/deposits/status?userId=${userId}`)
      const data = await response.json()
      
      if (data.success) {
        setDeposits(data.deposits)
        
        // Check for newly confirmed deposits
        data.deposits.forEach((deposit: DepositStatus) => {
          if (deposit.status === 'confirmed' && onDepositConfirmed) {
            onDepositConfirmed(deposit)
          }
        })
      }
    } catch (error) {
      console.error('Error fetching deposits:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Manual refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchDeposits()
    manualCheck() // Also trigger manual deposit monitoring
  }

  // Check specific deposit status
  const checkDepositStatus = async (depositId: string) => {
    try {
      const response = await fetch('/api/deposits/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositId })
      })
      
      const data = await response.json()
      
      if (data.status) {
        // Update the specific deposit in the list
        setDeposits(prev => prev.map(deposit => 
          deposit.id === depositId 
            ? { ...deposit, ...data.deposit, blockchain_status: data.blockchain }
            : deposit
        ))
      }
    } catch (error) {
      console.error('Error checking deposit status:', error)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Get blockchain explorer URL
  const getExplorerUrl = (txHash: string, cryptoType: string) => {
    const explorers = {
      BTC: `https://blockstream.info/tx/${txHash}`,
      ETH: `https://etherscan.io/tx/${txHash}`,
      USDT: `https://etherscan.io/tx/${txHash}`
    }
    return explorers[cryptoType as keyof typeof explorers] || '#'
  }

  // Get status badge
  const getStatusBadge = (deposit: DepositStatus) => {
    if (deposit.status === 'confirmed') {
      return <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Confirmed
      </Badge>
    }
    
    if (deposit.blockchain_status) {
      const { confirmations, requiredConfirmations } = deposit.blockchain_status
      return <Badge variant="pending" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {confirmations}/{requiredConfirmations} Confirmations
      </Badge>
    }
    
    return <Badge variant="warning" className="flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      Pending
    </Badge>
  }

  useEffect(() => {
    fetchDeposits()
    
    // Auto-refresh every 30 seconds for pending deposits
    const interval = setInterval(() => {
      const hasPendingDeposits = deposits.some(d => d.status === 'pending')
      if (hasPendingDeposits) {
        fetchDeposits()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Deposit Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span className="ml-2">Loading deposits...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Automatic Deposit Tracker
              {isPolling && <RefreshCw className="w-4 h-4 animate-spin text-primary" />}
            </CardTitle>
            <CardDescription>
              Real-time monitoring of your cryptocurrency deposits
              {lastCheck && (
                <span className="block text-xs mt-1">
                  Last checked: {lastCheck.toLocaleTimeString()}
                </span>
              )}
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {deposits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No deposits found</p>
            <p className="text-sm">Your deposits will appear here automatically</p>
          </div>
        ) : (
          <div className="space-y-4">
            {deposits.map((deposit) => (
              <div key={deposit.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold">
                      {formatCrypto(deposit.amount, deposit.crypto_type)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈ {formatCurrency(deposit.amount * 50000)} {/* Approximate USD value */}
                    </div>
                  </div>
                  {getStatusBadge(deposit)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Wallet Address:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {truncateAddress(deposit.wallet_address)}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(deposit.wallet_address)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {deposit.tx_hash && (
                    <div>
                      <span className="text-muted-foreground">Transaction Hash:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {truncateAddress(deposit.tx_hash)}
                        </code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(deposit.tx_hash)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                        >
                          <a 
                            href={getExplorerUrl(deposit.tx_hash, deposit.crypto_type)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(deposit.created_at).toLocaleString()}
                  </div>
                  
                  {deposit.status === 'pending' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => checkDepositStatus(deposit.id)}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Check Status
                    </Button>
                  )}
                </div>

                {deposit.blockchain_status && deposit.blockchain_status.status !== 'confirmed' && (
                  <div className="bg-muted/50 rounded p-3 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-warning" />
                      <span className="font-medium">Blockchain Status</span>
                    </div>
                    <div className="text-muted-foreground">
                      Confirmations: {deposit.blockchain_status.confirmations} / {deposit.blockchain_status.requiredConfirmations}
                    </div>
                    <div className="w-full bg-background rounded-full h-2 mt-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min(100, (deposit.blockchain_status.confirmations / deposit.blockchain_status.requiredConfirmations) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
