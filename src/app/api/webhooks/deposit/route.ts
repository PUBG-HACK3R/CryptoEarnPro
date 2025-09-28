import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Webhook endpoint for blockchain monitoring services like BlockCypher, Alchemy, etc.
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-webhook-signature')
    
    // Verify webhook signature (if using a service like BlockCypher)
    if (process.env.WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(body)
        .digest('hex')
      
      if (`sha256=${expectedSignature}` !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const webhookData = JSON.parse(body)
    
    // Handle different webhook formats from various services
    const transaction = await parseWebhookData(webhookData)
    
    if (!transaction) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
    }

    // Process the deposit
    await processWebhookDeposit(transaction)

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Parse webhook data from different services
async function parseWebhookData(data: any) {
  try {
    // BlockCypher format
    if (data.event && data.address && data.hash) {
      return {
        txHash: data.hash,
        toAddress: data.address,
        amount: data.total / Math.pow(10, 8), // Convert satoshis to BTC
        confirmations: data.confirmations || 0,
        cryptoType: 'BTC',
        timestamp: new Date(data.confirmed).getTime() / 1000
      }
    }

    // Alchemy/Etherscan format
    if (data.activity && data.activity.length > 0) {
      const activity = data.activity[0]
      return {
        txHash: activity.hash,
        toAddress: activity.toAddress,
        fromAddress: activity.fromAddress,
        amount: parseFloat(activity.value),
        confirmations: activity.blockNum ? 12 : 0, // Assume confirmed if blockNum exists
        cryptoType: activity.asset === 'ETH' ? 'ETH' : 'USDT',
        timestamp: Date.now() / 1000
      }
    }

    // Generic format
    if (data.txHash && data.toAddress && data.amount) {
      return {
        txHash: data.txHash,
        toAddress: data.toAddress,
        fromAddress: data.fromAddress,
        amount: parseFloat(data.amount),
        confirmations: data.confirmations || 0,
        cryptoType: data.cryptoType || 'BTC',
        timestamp: data.timestamp || Date.now() / 1000
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing webhook data:', error)
    return null
  }
}

// Process deposit from webhook
async function processWebhookDeposit(transaction: any) {
  try {
    // Check if transaction already exists
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('tx_hash', transaction.txHash)
      .single()

    if (existingTx) {
      console.log(`Transaction ${transaction.txHash} already processed`)
      return
    }

    // Find matching pending deposit
    const { data: pendingDeposit } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_address', transaction.toAddress)
      .eq('type', 'deposit')
      .eq('status', 'pending')
      .eq('crypto_type', transaction.cryptoType)
      .gte('amount', transaction.amount * 0.95) // 5% tolerance
      .lte('amount', transaction.amount * 1.05)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (pendingDeposit) {
      // Update existing pending deposit
      await supabase
        .from('transactions')
        .update({
          status: 'confirmed',
          tx_hash: transaction.txHash,
          updated_at: new Date().toISOString()
        })
        .eq('id', pendingDeposit.id)

      // Update user balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_balance')
        .eq('id', pendingDeposit.user_id)
        .single()

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            account_balance: profile.account_balance + transaction.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', pendingDeposit.user_id)
      }

      // Send notification (you can implement email/push notifications here)
      await sendDepositNotification(pendingDeposit.user_id, transaction)

      console.log(`Deposit confirmed via webhook: ${transaction.txHash}`)
    } else {
      // Create new unassigned deposit
      await supabase
        .from('transactions')
        .insert({
          user_id: null, // Will need manual assignment
          type: 'deposit',
          amount: transaction.amount,
          crypto_type: transaction.cryptoType,
          tx_hash: transaction.txHash,
          wallet_address: transaction.toAddress,
          status: 'confirmed'
        })

      console.log(`New unassigned deposit via webhook: ${transaction.txHash}`)
    }
  } catch (error) {
    console.error('Error processing webhook deposit:', error)
    throw error
  }
}

// Send deposit confirmation notification
async function sendDepositNotification(userId: string, transaction: any) {
  try {
    // You can implement email notifications, push notifications, etc.
    console.log(`Sending deposit notification to user ${userId}:`, {
      amount: transaction.amount,
      cryptoType: transaction.cryptoType,
      txHash: transaction.txHash
    })

    // Example: Insert notification into database
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'deposit_confirmed',
        title: 'Deposit Confirmed',
        message: `Your ${transaction.cryptoType} deposit of ${transaction.amount} has been confirmed.`,
        data: {
          txHash: transaction.txHash,
          amount: transaction.amount,
          cryptoType: transaction.cryptoType
        }
      })
  } catch (error) {
    console.error('Error sending deposit notification:', error)
  }
}
