'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, CRYPTO_ADDRESSES, generateQRCodeUrl, CryptoType } from '@/lib/utils'
import { createClientSupabase } from '@/lib/supabase'
import AutoDepositTracker from '@/components/AutoDepositTracker'

interface Transaction {
  id: string
  type: 'deposit' | 'withdrawal' | 'earning'
  amount: number
  crypto_type: string | null
  tx_hash: string | null
  wallet_address: string | null
  status: 'pending' | 'confirmed' | 'rejected' | 'approved'
  created_at: string
}

export default function WalletPage() {
  const { user, profile, loading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>('deposit')
  
  // Deposit form
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoType>('BTC')
  const [depositAmount, setDepositAmount] = useState('')
  const [txHash, setTxHash] = useState('')
  const [submittingDeposit, setSubmittingDeposit] = useState(false)
  
  // Withdrawal form
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false)
  
  const supabase = createClientSupabase()

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user])

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error fetching transactions:', error)
        return
      }

      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoadingTransactions(false)
    }
  }

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !depositAmount || !txHash) return

    setSubmittingDeposit(true)
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: parseFloat(depositAmount),
          crypto_type: selectedCrypto,
          tx_hash: txHash,
          status: 'pending'
        })

      if (error) {
        console.error('Error submitting deposit:', error)
        alert('Error submitting deposit. Please try again.')
        return
      }

      alert('Deposit submitted successfully! It will be reviewed by our team.')
      setDepositAmount('')
      setTxHash('')
      fetchTransactions()
    } catch (error) {
      console.error('Error submitting deposit:', error)
      alert('Error submitting deposit. Please try again.')
    } finally {
      setSubmittingDeposit(false)
    }
  }

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !withdrawAmount || !withdrawAddress) return

    const amount = parseFloat(withdrawAmount)
    if (amount > (profile?.account_balance || 0)) {
      alert('Insufficient balance for withdrawal.')
      return
    }

    setSubmittingWithdraw(true)
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          amount: amount,
          wallet_address: withdrawAddress,
          status: 'pending'
        })

      if (error) {
        console.error('Error submitting withdrawal:', error)
        alert('Error submitting withdrawal. Please try again.')
        return
      }

      alert('Withdrawal request submitted successfully! It will be processed within 24 hours.')
      setWithdrawAmount('')
      setWithdrawAddress('')
      fetchTransactions()
    } catch (error) {
      console.error('Error submitting withdrawal:', error)
      alert('Error submitting withdrawal. Please try again.')
    } finally {
      setSubmittingWithdraw(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return <Badge variant="success">Confirmed</Badge>
      case 'pending':
        return <Badge variant="pending">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading wallet...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Wallet & Transactions
          </h1>
          <p className="text-muted-foreground">
            Manage your crypto deposits, withdrawals, and transaction history
          </p>
        </div>

        {/* Balance Card */}
        <Card className="gradient-card mb-8">
          <CardHeader>
            <CardTitle>Account Balance</CardTitle>
            <CardDescription>Your current available balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success mb-2">
              {formatCurrency(profile?.account_balance || 0)}
            </div>
            <p className="text-sm text-muted-foreground">
              Total Invested: {formatCurrency(profile?.total_invested || 0)}
            </p>
          </CardContent>
        </Card>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === 'deposit' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('deposit')}
            className="flex-1"
          >
            Deposit
          </Button>
          <Button
            variant={activeTab === 'withdraw' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('withdraw')}
            className="flex-1"
          >
            Withdraw
          </Button>
          <Button
            variant={activeTab === 'history' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('history')}
            className="flex-1"
          >
            History
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'deposit' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deposit Form */}
            <Card>
              <CardHeader>
                <CardTitle>Make a Deposit</CardTitle>
                <CardDescription>
                  Send cryptocurrency to start earning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Cryptocurrency
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(CRYPTO_ADDRESSES) as CryptoType[]).map((crypto) => (
                        <Button
                          key={crypto}
                          type="button"
                          variant={selectedCrypto === crypto ? 'default' : 'outline'}
                          onClick={() => setSelectedCrypto(crypto)}
                          className="text-sm"
                        >
                          {crypto}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Amount (USD)
                    </label>
                    <Input
                      type="number"
                      placeholder="Enter amount in USD"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      min="10"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Transaction Hash
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter transaction hash after sending"
                      value={txHash}
                      onChange={(e) => setTxHash(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-primary"
                    disabled={submittingDeposit}
                  >
                    {submittingDeposit ? 'Submitting...' : 'Submit Deposit'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Deposit Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Deposit Instructions</CardTitle>
                <CardDescription>
                  Follow these steps to make a deposit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="font-medium mb-2">{selectedCrypto} Address:</p>
                  <code className="text-xs bg-background p-2 rounded block break-all">
                    {CRYPTO_ADDRESSES[selectedCrypto]}
                  </code>
                </div>

                <div className="text-center">
                  <img
                    src={generateQRCodeUrl(CRYPTO_ADDRESSES[selectedCrypto])}
                    alt={`${selectedCrypto} QR Code`}
                    className="mx-auto mb-2 border rounded"
                  />
                  <p className="text-xs text-muted-foreground">
                    Scan QR code with your wallet app
                  </p>
                </div>

                <div className="space-y-2 text-sm">
                  <p className="font-medium">Steps:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Send {selectedCrypto} to the address above</li>
                    <li>Copy the transaction hash</li>
                    <li>Enter the amount and hash in the form</li>
                    <li>Wait for admin verification</li>
                  </ol>
                </div>

                <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg">
                  <p className="text-xs text-warning-foreground">
                    ⚠️ Only send {selectedCrypto} to this address. Other cryptocurrencies will be lost.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Automatic Deposit Tracker - Show on all tabs */}
        {user && (
          <div className="mt-6">
            <AutoDepositTracker 
              userId={user.id} 
              onDepositConfirmed={() => {
                fetchTransactions()
                // Refresh user profile to update balance
                window.location.reload()
              }}
            />
          </div>
        )}

        {activeTab === 'withdraw' && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
              <CardDescription>
                Withdraw your earnings to your wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Amount (USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter withdrawal amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="10"
                    max={profile?.account_balance || 0}
                    step="0.01"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available: {formatCurrency(profile?.account_balance || 0)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Wallet Address
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your wallet address"
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="bg-info/10 border border-info/20 p-3 rounded-lg">
                  <p className="text-xs text-info-foreground">
                    ℹ️ Withdrawals are processed within 24 hours. A small network fee may apply.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary"
                  disabled={submittingWithdraw}
                >
                  {submittingWithdraw ? 'Submitting...' : 'Request Withdrawal'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Your recent deposits, withdrawals, and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTransactions ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">Loading transactions...</div>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          tx.type === 'deposit' ? 'bg-primary' :
                          tx.type === 'withdrawal' ? 'bg-warning' :
                          'bg-success'
                        }`} />
                        <div>
                          <p className="font-medium capitalize">{tx.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(tx.created_at)}
                          </p>
                          {tx.tx_hash && (
                            <p className="text-xs text-muted-foreground">
                              Hash: {tx.tx_hash.slice(0, 10)}...
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(tx.amount)}
                        </p>
                        {getStatusBadge(tx.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
