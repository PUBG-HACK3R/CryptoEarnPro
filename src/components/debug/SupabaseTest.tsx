'use client'

import { useState } from 'react'
import { createClientSupabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>('')
  const [testing, setTesting] = useState(false)
  const supabase = createClientSupabase()

  const testConnection = async () => {
    setTesting(true)
    setTestResult('Testing connection...')

    try {
      // Test 1: Basic connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error) {
        setTestResult(`❌ Connection Error: ${error.message}`)
        return
      }

      // Test 2: Check if tables exist
      const { data: plans, error: plansError } = await supabase.from('plans').select('*').limit(1)
      
      if (plansError) {
        setTestResult(`❌ Database Error: ${plansError.message}\n\n💡 Make sure you've run the database-schema.sql script in Supabase`)
        return
      }

      setTestResult(`✅ Connection successful!\n✅ Database tables exist\n✅ Ready to use`)
      
    } catch (err) {
      setTestResult(`❌ Network Error: ${err}\n\n💡 Check your internet connection and Supabase project status`)
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>🔧 Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={testing} className="w-full">
          {testing ? 'Testing...' : 'Test Supabase Connection'}
        </Button>
        
        {testResult && (
          <div className="p-3 bg-muted rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{testResult}</pre>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground">
          <p>This will test:</p>
          <ul className="list-disc list-inside mt-1">
            <li>Supabase connection</li>
            <li>Database tables exist</li>
            <li>API credentials work</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
