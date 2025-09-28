'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClientSupabase } from '@/lib/supabase'
import { ArrowLeft, Check, X, Eye } from 'lucide-react'

interface Withdrawal {
  id: string
  user_id: string
  amount: number
  wallet_address: string
  status: string
  created_at: string
  user_email: string
  rejection_reason?: string
  user_balance: number
}

export default function AdminWithdrawalsPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loadingWithdrawals, setLoadingWithdrawals] = useState(true)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState(false)
  
  const supabase = createClientSupabase()

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push('/dashboard')
        return
      }
      fetchWithdrawals()
    }
  }, [user, isAdmin, loading, router])

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          id,
          user_id,
          amount,
          wallet_address,
          status,
          created_at,
          rejection_reason,
          profiles!inner(email, account_balance)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedWithdrawals = data?.map(withdrawal => ({
        id: withdrawal.id,
        user_id: withdrawal.user_id,
        amount: withdrawal.amount,
        wallet_address: withdrawal.wallet_address,
        status: withdrawal.status,
        created_at: withdrawal.created_at,
        user_email: (withdrawal.profiles as any)?.email || 'Unknown',
        user_balance: (withdrawal.profiles as any)?.account_balance || 0,
        rejection_reason: withdrawal.rejection_reason
      })) || []

      setWithdrawals(formattedWithdrawals)
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
    } finally {
      setLoadingWithdrawals(false)
    }
  }

  const handleApproveWithdrawal = async (withdrawalId: string, amount: number, userId: string) => {
    setProcessing(true)
    try {
      // Update withdrawal status
      const { error: withdrawalError } = await supabase
        .from('withdrawal_requests')
        .update({ status: 'approved' })
        .eq('id', withdrawalId)

      if (withdrawalError) throw withdrawalError

      // Deduct from user balance - first get current balance, then update
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_balance')
        .eq('id', userId)
        .single()

      if (profile) {
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ 
            account_balance: profile.account_balance - amount
          })
          .eq('id', userId)

        if (balanceError) throw balanceError
      }

      // Create withdrawal transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'withdrawal',
          amount: amount,
          status: 'confirmed'
        })

      if (txError) throw txError

      // Refresh withdrawals
      await fetchWithdrawals()
      setSelectedWithdrawal(null)
    } catch (error) {
      console.error('Error approving withdrawal:', error)
      alert('Error approving withdrawal. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleRejectWithdrawal = async (withdrawalId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason
        })
        .eq('id', withdrawalId)

      if (error) throw error

      await fetchWithdrawals()
      setSelectedWithdrawal(null)
      setRejectionReason('')
    } catch (error) {
      console.error('Error rejecting withdrawal:', error)
      alert('Error rejecting withdrawal. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>
      case 'pending':
        return <Badge variant="pending">Pending</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading || loadingWithdrawals) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading withdrawals...</p>
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
                Manage Withdrawals
              </h1>
              <p className="text-muted-foreground">
                Review and process user withdrawal requests
              </p>
            </div>
          </div>
        </div>

        {/* Withdrawals List */}
        <div className="grid gap-6">
          {withdrawals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No withdrawal requests found</p>
              </CardContent>
            </Card>
          ) : (
            withdrawals.map((withdrawal) => (
              <Card key={withdrawal.id} className="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{withdrawal.user_email}</CardTitle>
                      <CardDescription>
                        {formatDate(withdrawal.created_at)}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(withdrawal.amount)}
                      </div>
                      {getStatusBadge(withdrawal.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Wallet Address
                      </label>
                      <p className="font-mono text-sm break-all">
                        {withdrawal.wallet_address}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        User Balance
                      </label>
                      <p className={`text-sm font-medium ${
                        withdrawal.user_balance >= withdrawal.amount 
                          ? 'text-success' 
                          : 'text-destructive'
                      }`}>
                        {formatCurrency(withdrawal.user_balance)}
                        {withdrawal.user_balance < withdrawal.amount && (
                          <span className="text-xs text-destructive ml-2">
                            (Insufficient funds)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {withdrawal.rejection_reason && (
                    <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <label className="text-sm font-medium text-destructive">
                        Rejection Reason
                      </label>
                      <p className="text-sm">{withdrawal.rejection_reason}</p>
                    </div>
                  )}

                  {withdrawal.status === 'pending' && (
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => setSelectedWithdrawal(withdrawal)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                      <Button
                        onClick={() => handleApproveWithdrawal(withdrawal.id, withdrawal.amount, withdrawal.user_id)}
                        disabled={processing || withdrawal.user_balance < withdrawal.amount}
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
        {selectedWithdrawal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Review Withdrawal</CardTitle>
                <CardDescription>
                  {selectedWithdrawal.user_email} • {formatCurrency(selectedWithdrawal.amount)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Wallet Address</label>
                  <p className="font-mono text-sm break-all p-2 bg-muted rounded">
                    {selectedWithdrawal.wallet_address}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">User Balance</label>
                  <p className={`text-sm font-medium p-2 rounded ${
                    selectedWithdrawal.user_balance >= selectedWithdrawal.amount 
                      ? 'bg-success/10 text-success' 
                      : 'bg-destructive/10 text-destructive'
                  }`}>
                    {formatCurrency(selectedWithdrawal.user_balance)}
                    {selectedWithdrawal.user_balance < selectedWithdrawal.amount && (
                      <span className="block text-xs">Insufficient funds for withdrawal</span>
                    )}
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
                    onClick={() => handleApproveWithdrawal(selectedWithdrawal.id, selectedWithdrawal.amount, selectedWithdrawal.user_id)}
                    disabled={processing || selectedWithdrawal.user_balance < selectedWithdrawal.amount}
                    className="flex-1 bg-success hover:bg-success/90"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleRejectWithdrawal(selectedWithdrawal.id)}
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
                    setSelectedWithdrawal(null)
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
