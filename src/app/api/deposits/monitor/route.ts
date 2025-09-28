import { NextRequest, NextResponse } from 'next/server'
import BlockchainMonitor from '@/lib/blockchain-monitor'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, cryptoType, userId } = await request.json()

    if (!walletAddress || !cryptoType) {
      return NextResponse.json(
        { error: 'Missing walletAddress or cryptoType' },
        { status: 400 }
      )
    }

    const monitor = new BlockchainMonitor()
    await monitor.processNewDeposits(walletAddress, cryptoType)

    return NextResponse.json({ 
      success: true, 
      message: 'Deposit monitoring completed' 
    })
  } catch (error) {
    console.error('Error in deposit monitoring:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Cron job endpoint for automatic monitoring
export async function GET(request: NextRequest) {
  try {
    // Verify cron job authorization
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const monitor = new BlockchainMonitor()

    // Get all unique wallet addresses from pending deposits
    const { data: pendingDeposits } = await supabase
      .from('transactions')
      .select('wallet_address, crypto_type')
      .eq('type', 'deposit')
      .eq('status', 'pending')

    if (!pendingDeposits || pendingDeposits.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No pending deposits to monitor' 
      })
    }

    // Group by wallet address and crypto type
    const addressGroups = pendingDeposits.reduce((acc: any, deposit) => {
      const key = `${deposit.wallet_address}_${deposit.crypto_type}`
      if (!acc[key]) {
        acc[key] = {
          walletAddress: deposit.wallet_address,
          cryptoType: deposit.crypto_type
        }
      }
      return acc
    }, {})

    // Monitor each unique address
    const monitoringPromises = Object.values(addressGroups).map(async (group: any) => {
      try {
        await monitor.processNewDeposits(group.walletAddress, group.cryptoType)
        return { success: true, address: group.walletAddress, crypto: group.cryptoType }
      } catch (error) {
        console.error(`Error monitoring ${group.walletAddress}:`, error)
        return { success: false, address: group.walletAddress, crypto: group.cryptoType, error }
      }
    })

    const results = await Promise.all(monitoringPromises)
    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Monitoring completed: ${successCount} successful, ${failureCount} failed`,
      results
    })
  } catch (error) {
    console.error('Error in automatic deposit monitoring:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
