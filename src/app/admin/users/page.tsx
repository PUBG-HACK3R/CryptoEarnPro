'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClientSupabase } from '@/lib/supabase'
import { ArrowLeft, Search, Eye, UserCheck, UserX } from 'lucide-react'

interface User {
  id: string
  email: string
  role: 'user' | 'admin'
  total_invested: number
  account_balance: number
  created_at: string
  active_plans: number
  total_transactions: number
}

export default function AdminUsersPage() {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [processing, setProcessing] = useState(false)
  
  const supabase = createClientSupabase()

  useEffect(() => {
    if (!loading) {
      if (!user || !isAdmin) {
        router.push('/dashboard')
        return
      }
      fetchUsers()
    }
  }, [user, isAdmin, loading, router])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      // Fetch users with their stats
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      // Fetch user plan counts
      const { data: planCounts, error: plansError } = await supabase
        .from('user_plans')
        .select('user_id')
        .eq('status', 'active')

      if (plansError) throw plansError

      // Fetch transaction counts
      const { data: transactionCounts, error: txError } = await supabase
        .from('transactions')
        .select('user_id')

      if (txError) throw txError

      // Process the data
      const usersWithStats = profiles?.map(profile => {
        const activePlans = planCounts?.filter(p => p.user_id === profile.id).length || 0
        const totalTransactions = transactionCounts?.filter(t => t.user_id === profile.id).length || 0

        return {
          id: profile.id,
          email: profile.email,
          role: profile.role as 'user' | 'admin',
          total_invested: profile.total_invested || 0,
          account_balance: profile.account_balance || 0,
          created_at: profile.created_at,
          active_plans: activePlans,
          total_transactions: totalTransactions
        }
      }) || []

      setUsers(usersWithStats)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return
    }

    setProcessing(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
      await fetchUsers()
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Error updating user role. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>
      case 'user':
        return <Badge variant="secondary">User</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
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
                Manage Users
              </h1>
              <p className="text-muted-foreground">
                View and manage platform users
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-6">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  {searchTerm || roleFilter !== 'all' ? 'No users match your filters' : 'No users found'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((userData) => (
              <Card key={userData.id} className="glass">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{userData.email}</CardTitle>
                      <CardDescription>
                        Joined {formatDate(userData.created_at)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(userData.role)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Total Invested
                      </label>
                      <p className="text-lg font-semibold text-success">
                        {formatCurrency(userData.total_invested)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Account Balance
                      </label>
                      <p className="text-lg font-semibold text-primary">
                        {formatCurrency(userData.account_balance)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Active Plans
                      </label>
                      <p className="text-lg font-semibold">
                        {userData.active_plans}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Transactions
                      </label>
                      <p className="text-lg font-semibold">
                        {userData.total_transactions}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setSelectedUser(userData)}
                      variant="outline"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    
                    {userData.role === 'user' ? (
                      <Button
                        onClick={() => handleRoleChange(userData.id, 'admin')}
                        disabled={processing}
                        size="sm"
                        className="bg-warning hover:bg-warning/90"
                      >
                        <UserCheck className="w-4 h-4 mr-2" />
                        Make Admin
                      </Button>
                    ) : userData.id !== user.id && (
                      <Button
                        onClick={() => handleRoleChange(userData.id, 'user')}
                        disabled={processing}
                        variant="outline"
                        size="sm"
                      >
                        <UserX className="w-4 h-4 mr-2" />
                        Remove Admin
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>User Details</CardTitle>
                <CardDescription>{selectedUser.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">User ID</label>
                    <p className="font-mono text-sm break-all">{selectedUser.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                    <p className="text-sm">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                    <Badge variant="success">Active</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-success/10 rounded-lg">
                    <label className="text-sm font-medium text-success">Total Invested</label>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(selectedUser.total_invested)}
                    </p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <label className="text-sm font-medium text-primary">Account Balance</label>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(selectedUser.account_balance)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <label className="text-sm font-medium">Active Investment Plans</label>
                    <p className="text-2xl font-bold">{selectedUser.active_plans}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <label className="text-sm font-medium">Total Transactions</label>
                    <p className="text-2xl font-bold">{selectedUser.total_transactions}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => router.push(`/admin/users/${selectedUser.id}/transactions`)}
                    variant="outline"
                    className="flex-1"
                  >
                    View Transactions
                  </Button>
                  <Button
                    onClick={() => router.push(`/admin/users/${selectedUser.id}/plans`)}
                    variant="outline"
                    className="flex-1"
                  >
                    View Plans
                  </Button>
                </div>
                
                <Button
                  onClick={() => setSelectedUser(null)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
