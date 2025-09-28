'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClientSupabase } from '@/lib/supabase'

interface AdminStats {
  totalUsers: number
  totalInvested: number
  totalBalance: number
  pendingDeposits: number
  pendingWithdrawals: number
  activePlans: number
}

interface RecentTransaction {
  id: string
  user_email: string
  type: string
  amount: number
  status: string
  created_at: string
}

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalInvested: 0,
    totalBalance: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    activePlans: 0
  })
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  
  const supabase = createClientSupabase()

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push('/dashboard')
        return
      }
      fetchAdminStats()
      fetchRecentTransactions()
    }
  }, [user, isAdmin, loading, router])

  const fetchAdminStats = async () => {
    try {
      // Fetch user stats
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('total_invested, account_balance')

      if (usersError) throw usersError

      // Fetch pending deposits
      const { data: deposits, error: depositsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('type', 'deposit')
        .eq('status', 'pending')

      if (depositsError) throw depositsError

      // Fetch pending withdrawals
      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('status', 'pending')

      if (withdrawalsError) throw withdrawalsError

      // Fetch active plans
      const { data: plans, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)

      if (plansError) throw plansError

      // Calculate stats
      const totalUsers = users?.length || 0
      const totalInvested = users?.reduce((sum, user) => sum + (user.total_invested || 0), 0) || 0
      const totalBalance = users?.reduce((sum, user) => sum + (user.account_balance || 0), 0) || 0

      setStats({
        totalUsers,
        totalInvested,
        totalBalance,
        pendingDeposits: deposits?.length || 0,
        pendingWithdrawals: withdrawals?.length || 0,
        activePlans: plans?.length || 0
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const fetchRecentTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          amount,
          status,
          created_at,
          profiles!inner(email)
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      const formattedTransactions = data?.map(tx => ({
        id: tx.id,
        user_email: (tx.profiles as any)?.email || 'Unknown',
        type: tx.type,
        amount: tx.amount,
        status: tx.status,
        created_at: tx.created_at
      })) || []

      setRecentTransactions(formattedTransactions)
    } catch (error) {
      console.error('Error fetching recent transactions:', error)
    }
  }

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return null
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage users, transactions, and platform settings
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-2xl text-primary">
                {stats.totalUsers}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Registered platform users
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardDescription>Total Invested</CardDescription>
              <CardTitle className="text-2xl text-success">
                {formatCurrency(stats.totalInvested)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                All user investments
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardDescription>Total Balance</CardDescription>
              <CardTitle className="text-2xl text-accent">
                {formatCurrency(stats.totalBalance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                All user balances
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardDescription>Pending Deposits</CardDescription>
              <CardTitle className="text-2xl text-warning">
                {stats.pendingDeposits}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Awaiting verification
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardDescription>Pending Withdrawals</CardDescription>
              <CardTitle className="text-2xl text-destructive">
                {stats.pendingWithdrawals}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Awaiting processing
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardDescription>Active Plans</CardDescription>
              <CardTitle className="text-2xl text-info">
                {stats.activePlans}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Available investment plans
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button 
            className="h-16 gradient-primary"
            onClick={() => router.push('/admin/deposits')}
          >
            <div className="text-center">
              <div className="font-semibold">Manage Deposits</div>
              <div className="text-xs opacity-90">{stats.pendingDeposits} pending</div>
            </div>
          </Button>
          
          <Button 
            className="h-16 gradient-primary"
            onClick={() => router.push('/admin/withdrawals')}
          >
            <div className="text-center">
              <div className="font-semibold">Manage Withdrawals</div>
              <div className="text-xs opacity-90">{stats.pendingWithdrawals} pending</div>
            </div>
          </Button>
          
          <Button 
            className="h-16 gradient-primary"
            onClick={() => router.push('/admin/plans')}
          >
            <div className="text-center">
              <div className="font-semibold">Manage Plans</div>
              <div className="text-xs opacity-90">{stats.activePlans} active</div>
            </div>
          </Button>
          
          <Button 
            className="h-16 gradient-primary"
            onClick={() => router.push('/admin/users')}
          >
            <div className="text-center">
              <div className="font-semibold">Manage Users</div>
              <div className="text-xs opacity-90">{stats.totalUsers} total</div>
            </div>
          </Button>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest platform activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent transactions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
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
                        <p className="font-medium">{tx.user_email}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {tx.type} • {formatDate(tx.created_at)}
                        </p>
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
      </main>
    </div>
  )
}
