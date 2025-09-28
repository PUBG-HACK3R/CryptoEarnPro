'use client'

import { useAuth } from '@/contexts/AuthContext'
import SupabaseTest from '@/components/debug/SupabaseTest'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DebugPage() {
  const { user, profile, isAdmin, loading } = useAuth()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-center mb-8">Debug Dashboard</h1>
        
        {/* Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current user and admin status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Loading:</label>
                <p className="font-mono">{loading ? '✅ True' : '❌ False'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User Exists:</label>
                <p className="font-mono">{user ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Profile Exists:</label>
                <p className="font-mono">{profile ? '✅ Yes' : '❌ No'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Is Admin:</label>
                <p className="font-mono">{isAdmin ? '✅ Yes' : '❌ No'}</p>
              </div>
            </div>
            
            {user && (
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User Email:</label>
                  <p className="font-mono text-sm">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">User ID:</label>
                  <p className="font-mono text-xs break-all">{user.id}</p>
                </div>
              </div>
            )}
            
            {profile && (
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Profile Role:</label>
                  <Badge variant={profile.role === 'admin' ? 'destructive' : 'secondary'}>
                    {profile.role}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Profile Email:</label>
                  <p className="font-mono text-sm">{profile.email}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Access Instructions */}
        {user && !isAdmin && (
          <Card className="border-warning">
            <CardHeader>
              <CardTitle className="text-warning">Admin Access Required</CardTitle>
              <CardDescription>Your account needs admin privileges to access /admin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-warning/10 rounded-lg">
                <h3 className="font-semibold mb-2">To fix this:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Go to your Supabase Dashboard</li>
                  <li>Navigate to Table Editor → profiles</li>
                  <li>Find your user: <code className="bg-muted px-1 rounded">{user.email}</code></li>
                  <li>Change the 'role' field from 'user' to 'admin'</li>
                  <li>Save and refresh this page</li>
                </ol>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">Or run this SQL in Supabase:</h3>
                <code className="block text-sm bg-background p-2 rounded border">
                  UPDATE profiles SET role = 'admin' WHERE email = '{user.email}';
                </code>
              </div>
            </CardContent>
          </Card>
        )}

        {isAdmin && (
          <Card className="border-success">
            <CardContent className="pt-6">
              <div className="text-center">
                <Badge variant="success" className="mb-2">Admin Access Granted</Badge>
                <p className="text-sm text-muted-foreground">
                  You can now access the admin panel at <a href="/admin" className="text-primary hover:underline">/admin</a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        
        <SupabaseTest />
        
        <div className="p-4 bg-muted rounded-lg">
          <h2 className="font-semibold mb-2">Environment Check</h2>
          <div className="text-sm space-y-1">
            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
            <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
