'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClientSupabase } from '@/lib/supabase'
import { ArrowLeft, Check, X, Eye } from 'lucide-react'

interface Deposit {
  id: string
  user_id: string
  amount: number
  crypto_type: string
  tx_hash: string
  wallet_address: string
  status: string
  created_at: string
  user_email: string
  rejection_reason?: string
}

export default function AdminDepositsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [loadingDeposits, setLoadingDeposits] = useState(true)
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  
  const supabase = createClientSupabase()

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push('/dashboard')
        return
      }
      fetchDeposits()
    }
  }, [user, isAdmin, loading, router])

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          user_id,
          amount,
          crypto_type,
          tx_hash,
          wallet_address,
          status,
          created_at,
          rejection_reason,
          profiles!inner(email)
        `)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedDeposits = data?.map(deposit => ({
        id: deposit.id,
        user_id: deposit.user_id,
        amount: deposit.amount,
        crypto_type: deposit.crypto_type || '',
        tx_hash: deposit.tx_hash || '',
        wallet_address: deposit.wallet_address || '',
        status: deposit.status,
        created_at: deposit.created_at,
        user_email: (deposit.profiles as any)?.email || 'Unknown',
        rejection_reason: deposit.rejection_reason
      })) || []

      setDeposits(formattedDeposits)
    } catch (error) {
      console.error('Error fetching deposits:', error)
    } finally {
      setLoadingDeposits(false)
    }
  }

  const handleApproveDeposit = async (depositId: string, amount: number, userId: string) => {
    setProcessing(true)
    try {
      // Update transaction status
      const { error: txError } = await supabase
        .from('transactions')
        .update({ status: 'confirmed' })
        .eq('id', depositId)

      if (txError) throw txError

      // Update user balance - first get current balance, then update
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_balance')
        .eq('id', userId)
        .single()

      if (profile) {
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ 
            account_balance: profile.account_balance + amount
          })
          .eq('id', userId)

        if (balanceError) throw balanceError
      }

      // Refresh deposits
      await fetchDeposits()
      setSelectedDeposit(null)
    } catch (error) {
      console.error('Error approving deposit:', error)
      alert('Error approving deposit. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectDeposit = async (depositId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', depositId)

      if (error) throw error

      await fetchDeposits()
      setSelectedDeposit(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting deposit:', error)
      alert('Error rejecting deposit. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>
      case 'pending':
        return <Badge variant="pending">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading || loadingDeposits) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading deposits...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Admin</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Manage Deposits
              </h1>
              <p className="text-muted-foreground">
                Review and approve user deposits
              </p>
            </div>
          </div>
        </div>

        {/* Deposits List */}
        <div className="grid gap-6">
          {deposits.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No deposits found</p>
              </CardContent>
            </Card>
          ) : (
            deposits.map((deposit) => (
              <Card key={deposit.id} className="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{deposit.user_email}</CardTitle>
                      <CardDescription>
                        {formatDate(deposit.created_at)} • {deposit.crypto_type}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(deposit.amount)}
                      </div>
                      {getStatusBadge(deposit.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Transaction Hash
                      </label>
                      <p className="font-mono text-sm break-all">
                        {deposit.tx_hash || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Wallet Address
                      </label>
                      <p className="font-mono text-sm break-all">
                        {deposit.wallet_address || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {deposit.rejection_reason && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <label className="text-sm font-medium text-destructive">
                        Rejection Reason
                      </label>
                      <p className="text-sm">{deposit.rejection_reason}</p>
                    </div>
                  )}

                  {deposit.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setSelectedDeposit(deposit)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                      <Button
                        onClick={() => handleApproveDeposit(deposit.id, deposit.amount, deposit.user_id)}
                        disabled={processing}
                        size="sm"
                        className="bg-success hover:bg-success/90"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Review Modal */}
        {selectedDeposit && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Review Deposit</CardTitle>
                <CardDescription>
                  {selectedDeposit.user_email} • {formatCurrency(selectedDeposit.amount)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Transaction Hash</label>
                  <p className="font-mono text-sm break-all p-2 bg-muted rounded">
                    {selectedDeposit.tx_hash || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleApproveDeposit(selectedDeposit.id, selectedDeposit.amount, selectedDeposit.user_id)}
                    disabled={processing}
                    className="flex-1 bg-success hover:bg-success/90"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleRejectDeposit(selectedDeposit.id)}
                    disabled={processing || !rejectionReason.trim()}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
                
                <Button
                  onClick={() => {
                    setSelectedDeposit(null)
                    setRejectionReason('')
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
