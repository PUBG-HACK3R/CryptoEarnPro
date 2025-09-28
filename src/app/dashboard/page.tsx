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

interface UserPlan {
  id: string
  plan_name: string
  invested_amount: number
  daily_earning: number
  total_earned: number
  status: string
  start_date: string
  end_date: string
}

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  created_at: string
}

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [userPlans, setUserPlans] = useState<UserPlan[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const supabase = createClientSupabase()

  useEffect(() => {
    if (user && !loading) {
      fetchUserData()
    }
  }, [user, loading])

  const fetchUserData = async () => {
    try {
      // Fetch user plans
      const { data: plansData, error: plansError } = await supabase
        .from('user_plans')
        .select(`
          id,
          invested_amount,
          daily_earning,
          total_earned,
          status,
          start_date,
          end_date,
          plans!inner(plan_name)
        `)
        .eq('user_id', user?.id)
        .eq('status', 'active')

      if (plansError) throw plansError

      const formattedPlans = plansData?.map(plan => ({
        id: plan.id,
        plan_name: (plan.plans as any)?.plan_name || 'Unknown Plan',
        invested_amount: plan.invested_amount,
        daily_earning: plan.daily_earning,
        total_earned: plan.total_earned,
        status: plan.status,
        start_date: plan.start_date,
        end_date: plan.end_date
      })) || []

      setUserPlans(formattedPlans)

      // Fetch recent transactions
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('id, type, amount, status, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (txError) throw txError
      setRecentTransactions(txData || [])

    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will be redirected by the auth context
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Track your investments and earnings in real-time
          </p>
          <div className="mt-4 flex items-center space-x-4">
            <Badge variant="outline">User ID: {user.id.slice(0, 8)}...</Badge>
            {profile?.role === 'admin' && (
              <Badge variant="success">Admin Access</Badge>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardDescription>Total Invested</CardDescription>
              <CardTitle className="text-2xl text-primary">
                {formatCurrency(profile?.total_invested || 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Across all investment plans
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardDescription>Account Balance</CardDescription>
              <CardTitle className="text-2xl text-success">
                {formatCurrency(profile?.account_balance || 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Available for withdrawal
              </p>
            </CardContent>
          </Card>

          <Card className="gradient-card">
            <CardHeader className="pb-2">
              <CardDescription>Total Earnings</CardDescription>
              <CardTitle className="text-2xl text-accent">
                {formatCurrency((profile?.account_balance || 0) - (profile?.total_invested || 0))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Profit generated
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your investments and account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full gradient-primary"
                onClick={() => router.push('/plans')}
              >
                View Investment Plans
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/wallet?tab=deposit')}
              >
                Make a Deposit
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/wallet?tab=withdraw')}
              >
                Request Withdrawal
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Plans</CardTitle>
              <CardDescription>
                Your current investment portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingData ? (
                <div className="text-center py-8">
                  <div className="animate-pulse">
                    <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Loading plans...</p>
                  </div>
                </div>
              ) : userPlans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No active plans yet
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/plans')}
                  >
                    Browse Plans
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {userPlans.map((plan) => (
                    <div key={plan.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{plan.plan_name}</h3>
                        <Badge variant="success">{plan.status}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Invested</p>
                          <p className="font-medium">{formatCurrency(plan.invested_amount)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Daily Earning</p>
                          <p className="font-medium text-success">{formatCurrency(plan.daily_earning)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Earned</p>
                          <p className="font-medium text-primary">{formatCurrency(plan.total_earned)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p className="font-medium">{formatDate(plan.end_date)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/plans')}
                  >
                    View All Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your latest account activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Loading transactions...</p>
                </div>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No transactions yet. Start by making your first deposit!
                </p>
                <Button 
                  variant="outline"
                  onClick={() => router.push('/wallet?tab=deposit')}
                >
                  Make Deposit
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {tx.type === 'withdrawal' ? '-' : '+'}{formatCurrency(tx.amount)}
                      </p>
                      <Badge variant={
                        tx.status === 'confirmed' ? 'success' :
                        tx.status === 'pending' ? 'pending' :
                        tx.status === 'rejected' ? 'destructive' :
                        'outline'
                      }>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/wallet')}
                >
                  View All Transactions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
