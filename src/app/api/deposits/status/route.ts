import { NextRequest, NextResponse } from 'next/server'
import BlockchainMonitor from '@/lib/blockchain-monitor'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { depositId, txHash } = await request.json()

    if (!depositId && !txHash) {
      return NextResponse.json(
        { error: 'Either depositId or txHash is required' },
        { status: 400 }
      )
    }

    let deposit
    if (depositId) {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', depositId)
        .eq('type', 'deposit')
        .single()
      deposit = data
    } else if (txHash) {
      const { data } = await supabase
        .from('transactions')
        .select('*')
        .eq('tx_hash', txHash)
        .eq('type', 'deposit')
        .single()
      deposit = data
    }

    if (!deposit) {
      return NextResponse.json(
        { error: 'Deposit not found' },
        { status: 404 }
      )
    }

    // If deposit is already confirmed, return current status
    if (deposit.status === 'confirmed') {
      return NextResponse.json({
        status: 'confirmed',
        deposit,
        confirmations: 'confirmed',
        message: 'Deposit has been confirmed and processed'
      })
    }

    // Check blockchain status if we have a transaction hash
    if (deposit.tx_hash) {
      const monitor = new BlockchainMonitor()
      const blockchainStatus = await monitor.getDepositStatus(deposit.tx_hash)
      
      return NextResponse.json({
        status: deposit.status,
        deposit,
        blockchain: blockchainStatus,
        message: blockchainStatus.status === 'confirmed' 
          ? 'Transaction confirmed on blockchain, processing...' 
          : `Waiting for confirmations: ${blockchainStatus.confirmations}/${blockchainStatus.requiredConfirmations}`
      })
    }

    // Return current database status
    return NextResponse.json({
      status: deposit.status,
      deposit,
      message: deposit.status === 'pending' 
        ? 'Waiting for transaction to be detected on blockchain'
        : `Deposit status: ${deposit.status}`
    })

  } catch (error) {
    console.error('Error checking deposit status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get all deposits for a user with real-time status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const { data: deposits, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'deposit')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Add real-time status for pending deposits
    const monitor = new BlockchainMonitor()
    const depositsWithStatus = await Promise.all(
      deposits.map(async (deposit) => {
        if (deposit.status === 'pending' && deposit.tx_hash) {
          try {
            const blockchainStatus = await monitor.getDepositStatus(deposit.tx_hash)
            return {
              ...deposit,
              blockchain_status: blockchainStatus
            }
          } catch (error) {
            console.error(`Error checking status for ${deposit.tx_hash}:`, error)
            return deposit
          }
        }
        return deposit
      })
    )

    return NextResponse.json({
      success: true,
      deposits: depositsWithStatus
    })

  } catch (error) {
    console.error('Error fetching user deposits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
