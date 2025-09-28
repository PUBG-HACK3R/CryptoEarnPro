'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, calculateROI } from '@/lib/utils'
import { createClientSupabase } from '@/lib/supabase'

interface Plan {
  id: string
  plan_name: string
  daily_rate_percent: number
  duration_days: number
  min_deposit_usd: number
  max_deposit_usd: number
  is_active: boolean
}

export default function PlansPage() {
  const { user, loading } = useAuth()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const supabase = createClientSupabase()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('min_deposit_usd', { ascending: true })

      if (error) {
        console.error('Error fetching plans:', error)
        return
      }

      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleInvest = (plan: Plan) => {
    setSelectedPlan(plan)
    // This will later open a modal for investment
    console.log('Investing in plan:', plan.plan_name)
  }

  if (loading || loadingPlans) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading investment plans...</p>
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
            Investment Plans
          </h1>
          <p className="text-muted-foreground">
            Choose from our carefully crafted investment plans with guaranteed daily returns
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => {
            const totalROI = calculateROI(1000, plan.daily_rate_percent, plan.duration_days)
            const totalReturn = ((totalROI / 1000) * 100).toFixed(1)
            
            return (
              <Card key={plan.id} className="gradient-card hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl text-foreground">
                      {plan.plan_name}
                    </CardTitle>
                    <Badge variant="success" className="text-xs">
                      {plan.daily_rate_percent}% Daily
                    </Badge>
                  </div>
                  <CardDescription>
                    Professional investment plan with guaranteed returns
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Daily Rate</p>
                      <p className="text-lg font-bold text-success">
                        {plan.daily_rate_percent}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="text-lg font-bold text-primary">
                        {plan.duration_days} Days
                      </p>
                    </div>
                  </div>

                  {/* Investment Range */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Minimum:</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(plan.min_deposit_usd)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Maximum:</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(plan.max_deposit_usd)}
                      </span>
                    </div>
                  </div>

                  {/* ROI Calculation */}
                  <div className="bg-accent/10 p-3 rounded-lg border border-accent/20">
                    <p className="text-xs text-muted-foreground mb-1">
                      Total Return ({plan.duration_days} days)
                    </p>
                    <p className="text-lg font-bold text-accent">
                      +{totalReturn}% ROI
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Example: $1,000 → {formatCurrency(1000 + totalROI)}
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button 
                    onClick={() => handleInvest(plan)}
                    className="w-full gradient-primary"
                  >
                    Start Investment
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
              <CardDescription>
                Simple steps to start earning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Choose a Plan</p>
                  <p className="text-sm text-muted-foreground">
                    Select an investment plan that fits your budget
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Make Deposit</p>
                  <p className="text-sm text-muted-foreground">
                    Send cryptocurrency to our secure wallet
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Earn Daily</p>
                  <p className="text-sm text-muted-foreground">
                    Receive guaranteed daily returns automatically
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security & Trust</CardTitle>
              <CardDescription>
                Your investments are protected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-success rounded-full"></div>
                <span className="text-sm">SSL Encrypted Platform</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-success rounded-full"></div>
                <span className="text-sm">Secure Crypto Wallets</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-success rounded-full"></div>
                <span className="text-sm">24/7 Monitoring</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-success rounded-full"></div>
                <span className="text-sm">Transparent Operations</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-success rounded-full"></div>
                <span className="text-sm">Instant Withdrawals</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
