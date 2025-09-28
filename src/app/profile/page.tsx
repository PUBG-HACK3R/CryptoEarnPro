'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Navbar from '@/components/layout/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { createClientSupabase } from '@/lib/supabase'

export default function ProfilePage() {
  const { user, profile, loading, signOut } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  
  const supabase = createClientSupabase()

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters long')
      return
    }

    setChangingPassword(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        alert('Error changing password: ' + error.message)
        return
      }

      alert('Password changed successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPasswordForm(false)
    } catch (error) {
      console.error('Error changing password:', error)
      alert('Error changing password. Please try again.')
    } finally {
      setChangingPassword(false)
    }
  }

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-center">
            <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
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
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and security
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <p className="text-foreground font-medium">{user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  User ID
                </label>
                <div className="flex items-center space-x-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {user.id}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(user.id)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Account Type
                </label>
                <div className="flex items-center space-x-2">
                  <Badge variant={profile?.role === 'admin' ? 'success' : 'default'}>
                    {profile?.role === 'admin' ? 'Administrator' : 'Standard User'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Member Since
                </label>
                <p className="text-foreground">
                  {formatDate(user.created_at || new Date().toISOString())}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email Verified
                </label>
                <Badge variant={user.email_confirmed_at ? 'success' : 'warning'}>
                  {user.email_confirmed_at ? 'Verified' : 'Pending Verification'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Investment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Summary</CardTitle>
              <CardDescription>
                Your investment portfolio overview
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Invested</p>
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(profile?.total_invested || 0)}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Current Balance</p>
                  <p className="text-lg font-bold text-success">
                    {formatCurrency(profile?.account_balance || 0)}
                  </p>
                </div>
              </div>

              <div className="text-center p-3 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                <p className="text-xl font-bold text-accent">
                  {formatCurrency((profile?.account_balance || 0) - (profile?.total_invested || 0))}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Keep investing to maximize your returns!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showPasswordForm ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Password</p>
                      <p className="text-sm text-muted-foreground">
                        Last updated: Recently
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordForm(true)}
                    >
                      Change Password
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Badge variant="outline">Coming Soon</Badge>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      type="submit"
                      disabled={changingPassword}
                      className="flex-1"
                    >
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setCurrentPassword('')
                        setNewPassword('')
                        setConfirmPassword('')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/dashboard'}
              >
                Go to Dashboard
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/wallet'}
              >
                Manage Wallet
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = '/plans'}
              >
                View Investment Plans
              </Button>

              <div className="border-t pt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Get support for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Documentation</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Learn how to use the platform
                </p>
                <Button variant="outline" size="sm">
                  View Docs
                </Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-medium mb-2">Contact Support</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get help from our team
                </p>
                <Button variant="outline" size="sm">
                  Contact Us
                </Button>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <h3 className="font-medium mb-2">FAQ</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Find answers to common questions
                </p>
                <Button variant="outline" size="sm">
                  View FAQ
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
