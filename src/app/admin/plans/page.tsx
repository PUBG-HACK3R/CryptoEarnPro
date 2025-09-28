'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { formatCurrency } from '@/lib/utils'
import { createClientSupabase } from '@/lib/supabase'
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react'

interface Plan {
  id: string
  plan_name: string
  daily_rate_percent: number
  duration_days: number
  min_deposit_usd: number
  max_deposit_usd: number
  is_active: boolean
  created_at: string
}

interface PlanForm {
  plan_name: string
  daily_rate_percent: number
  duration_days: number
  min_deposit_usd: number
  max_deposit_usd: number
  is_active: boolean
}

export default function AdminPlansPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [processing, setProcessing] = useState(false)
  const [formData, setFormData] = useState<PlanForm>({
    plan_name: '',
    daily_rate_percent: 0,
    duration_days: 0,
    min_deposit_usd: 0,
    max_deposit_usd: 0,
    is_active: true
  })
  
  const supabase = createClientSupabase()

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push('/dashboard')
        return
      }
      fetchPlans()
    }
  }, [user, isAdmin, loading, router])

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcessing(true)

    try {
      if (editingPlan) {
        // Update existing plan
        const { error } = await supabase
          .from('plans')
          .update(formData)
          .eq('id', editingPlan.id)

        if (error) throw error
      } else {
        // Create new plan
        const { error } = await supabase
          .from('plans')
          .insert([formData])

        if (error) throw error
      }

      await fetchPlans()
      resetForm()
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('Error saving plan. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      plan_name: plan.plan_name,
      daily_rate_percent: plan.daily_rate_percent,
      duration_days: plan.duration_days,
      min_deposit_usd: plan.min_deposit_usd,
      max_deposit_usd: plan.max_deposit_usd,
      is_active: plan.is_active
    })
    setShowForm(true)
  }

  const handleDelete = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planId)

      if (error) throw error
      await fetchPlans()
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert('Error deleting plan. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const togglePlanStatus = async (planId: string, currentStatus: boolean) => {
    setProcessing(true)
    try {
      const { error } = await supabase
        .from('plans')
        .update({ is_active: !currentStatus })
        .eq('id', planId)

      if (error) throw error
      await fetchPlans()
    } catch (error) {
      console.error('Error updating plan status:', error)
      alert('Error updating plan status. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const resetForm = () => {
    setFormData({
      plan_name: '',
      daily_rate_percent: 0,
      duration_days: 0,
      min_deposit_usd: 0,
      max_deposit_usd: 0,
      is_active: true
    })
    setEditingPlan(null)
    setShowForm(false)
  }

  if (loading || loadingPlans) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading plans...</p>
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
                Manage Plans
              </h1>
              <p className="text-muted-foreground">
                Create and manage investment plans
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="gradient-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className="glass">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.plan_name}</CardTitle>
                  <Badge variant={plan.is_active ? "success" : "secondary"}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription>
                  {plan.daily_rate_percent}% daily for {plan.duration_days} days
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-muted-foreground">Min Deposit</label>
                    <p className="font-medium">{formatCurrency(plan.min_deposit_usd)}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground">Max Deposit</label>
                    <p className="font-medium">{formatCurrency(plan.max_deposit_usd)}</p>
                  </div>
                </div>

                <div className="text-sm">
                  <label className="text-muted-foreground">Total Return</label>
                  <p className="font-medium text-success">
                    {(plan.daily_rate_percent * plan.duration_days).toFixed(1)}%
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={plan.is_active}
                      onCheckedChange={() => togglePlanStatus(plan.id, plan.is_active)}
                      disabled={processing}
                    />
                    <span className="text-sm">Active</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => handleEdit(plan)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(plan.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Plan Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>
                  {editingPlan ? 'Edit Plan' : 'Create New Plan'}
                </CardTitle>
                <CardDescription>
                  {editingPlan ? 'Update plan details' : 'Add a new investment plan'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="plan_name">Plan Name</Label>
                    <Input
                      id="plan_name"
                      value={formData.plan_name}
                      onChange={(e) => setFormData({...formData, plan_name: e.target.value})}
                      placeholder="e.g., Tier 1: Explorer"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="daily_rate_percent">Daily Rate (%)</Label>
                    <Input
                      id="daily_rate_percent"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.daily_rate_percent}
                      onChange={(e) => setFormData({...formData, daily_rate_percent: parseFloat(e.target.value) || 0})}
                      placeholder="e.g., 1.5"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration_days">Duration (Days)</Label>
                    <Input
                      id="duration_days"
                      type="number"
                      min="1"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value) || 0})}
                      placeholder="e.g., 30"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="min_deposit_usd">Minimum Deposit (USD)</Label>
                    <Input
                      id="min_deposit_usd"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.min_deposit_usd}
                      onChange={(e) => setFormData({...formData, min_deposit_usd: parseFloat(e.target.value) || 0})}
                      placeholder="e.g., 100"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_deposit_usd">Maximum Deposit (USD)</Label>
                    <Input
                      id="max_deposit_usd"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.max_deposit_usd}
                      onChange={(e) => setFormData({...formData, max_deposit_usd: parseFloat(e.target.value) || 0})}
                      placeholder="e.g., 1000"
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                    <Label htmlFor="is_active">Active Plan</Label>
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Button
                      type="submit"
                      disabled={processing}
                      className="flex-1 gradient-primary"
                    >
                      {processing ? 'Saving...' : (editingPlan ? 'Update Plan' : 'Create Plan')}
                    </Button>
                    <Button
                      type="button"
                      onClick={resetForm}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
