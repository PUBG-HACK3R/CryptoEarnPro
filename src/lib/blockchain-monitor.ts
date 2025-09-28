import { createClient } from '@supabase/supabase-js'

// Blockchain API configurations
const BLOCKCHAIN_APIS = {
  BTC: {
    mainnet: 'https://blockstream.info/api',
    testnet: 'https://blockstream.info/testnet/api'
  },
  ETH: {
    mainnet: 'https://api.etherscan.io/api',
    testnet: 'https://api-sepolia.etherscan.io/api'
  },
  USDT: {
    mainnet: 'https://api.etherscan.io/api', // USDT is ERC-20 on Ethereum
    testnet: 'https://api-sepolia.etherscan.io/api'
  }
}

interface DepositTransaction {
  txHash: string
  fromAddress: string
  toAddress: string
  amount: number
  confirmations: number
  timestamp: number
  cryptoType: 'BTC' | 'ETH' | 'USDT'
}

class BlockchainMonitor {
  private supabase: any
  private isTestnet: boolean

  constructor(isTestnet = false) {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    this.isTestnet = isTestnet
  }

  // Monitor Bitcoin transactions
  async monitorBTCAddress(address: string): Promise<DepositTransaction[]> {
    try {
      const network = this.isTestnet ? 'testnet' : 'mainnet'
      const response = await fetch(`${BLOCKCHAIN_APIS.BTC[network]}/address/${address}/txs`)
      const transactions = await response.json()

      return transactions
        .filter((tx: any) => tx.vout.some((output: any) => 
          output.scriptpubkey_address === address && output.value > 0
        ))
        .map((tx: any) => ({
          txHash: tx.txid,
          fromAddress: tx.vin[0]?.prevout?.scriptpubkey_address || 'unknown',
          toAddress: address,
          amount: tx.vout.find((output: any) => output.scriptpubkey_address === address)?.value / 100000000, // Convert satoshis to BTC
          confirmations: tx.status.confirmed ? tx.status.block_height : 0,
          timestamp: tx.status.block_time,
          cryptoType: 'BTC' as const
        }))
    } catch (error) {
      console.error('Error monitoring BTC address:', error)
      return []
    }
  }

  // Monitor Ethereum transactions
  async monitorETHAddress(address: string): Promise<DepositTransaction[]> {
    try {
      const network = this.isTestnet ? 'testnet' : 'mainnet'
      const apiKey = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'
      
      const response = await fetch(
        `${BLOCKCHAIN_APIS.ETH[network]}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
      )
      const data = await response.json()

      if (data.status !== '1') return []

      return data.result
        .filter((tx: any) => tx.to?.toLowerCase() === address.toLowerCase() && tx.value !== '0')
        .map((tx: any) => ({
          txHash: tx.hash,
          fromAddress: tx.from,
          toAddress: tx.to,
          amount: parseFloat(tx.value) / Math.pow(10, 18), // Convert Wei to ETH
          confirmations: parseInt(tx.confirmations),
          timestamp: parseInt(tx.timeStamp),
          cryptoType: 'ETH' as const
        }))
    } catch (error) {
      console.error('Error monitoring ETH address:', error)
      return []
    }
  }

  // Monitor USDT (ERC-20) transactions
  async monitorUSDTAddress(address: string): Promise<DepositTransaction[]> {
    try {
      const network = this.isTestnet ? 'testnet' : 'mainnet'
      const apiKey = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'
      const usdtContract = '0xdAC17F958D2ee523a2206206994597C13D831ec7' // USDT contract address
      
      const response = await fetch(
        `${BLOCKCHAIN_APIS.USDT[network]}?module=account&action=tokentx&contractaddress=${usdtContract}&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`
      )
      const data = await response.json()

      if (data.status !== '1') return []

      return data.result
        .filter((tx: any) => tx.to?.toLowerCase() === address.toLowerCase() && tx.value !== '0')
        .map((tx: any) => ({
          txHash: tx.hash,
          fromAddress: tx.from,
          toAddress: tx.to,
          amount: parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal)), // Convert to USDT
          confirmations: parseInt(tx.confirmations),
          timestamp: parseInt(tx.timeStamp),
          cryptoType: 'USDT' as const
        }))
    } catch (error) {
      console.error('Error monitoring USDT address:', error)
      return []
    }
  }

  // Check for new deposits and update database
  async processNewDeposits(walletAddress: string, cryptoType: 'BTC' | 'ETH' | 'USDT'): Promise<void> {
    try {
      let transactions: DepositTransaction[] = []

      switch (cryptoType) {
        case 'BTC':
          transactions = await this.monitorBTCAddress(walletAddress)
          break
        case 'ETH':
          transactions = await this.monitorETHAddress(walletAddress)
          break
        case 'USDT':
          transactions = await this.monitorUSDTAddress(walletAddress)
          break
      }

      // Filter transactions with sufficient confirmations
      const confirmedTransactions = transactions.filter(tx => {
        const requiredConfirmations = cryptoType === 'BTC' ? 3 : 12 // BTC: 3, ETH/USDT: 12
        return tx.confirmations >= requiredConfirmations
      })

      for (const tx of confirmedTransactions) {
        await this.processDeposit(tx, walletAddress)
      }
    } catch (error) {
      console.error('Error processing new deposits:', error)
    }
  }

  // Process individual deposit
  private async processDeposit(transaction: DepositTransaction, walletAddress: string): Promise<void> {
    try {
      // Check if transaction already exists
      const { data: existingTx } = await this.supabase
        .from('transactions')
        .select('id')
        .eq('tx_hash', transaction.txHash)
        .single()

      if (existingTx) {
        console.log(`Transaction ${transaction.txHash} already processed`)
        return
      }

      // Find pending deposit with matching wallet address
      const { data: pendingDeposit } = await this.supabase
        .from('transactions')
        .select('*')
        .eq('wallet_address', walletAddress)
        .eq('type', 'deposit')
        .eq('status', 'pending')
        .eq('crypto_type', transaction.cryptoType)
        .gte('amount', transaction.amount * 0.95) // Allow 5% tolerance
        .lte('amount', transaction.amount * 1.05)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (pendingDeposit) {
        // Update existing pending deposit
        await this.supabase
          .from('transactions')
          .update({
            status: 'confirmed',
            tx_hash: transaction.txHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', pendingDeposit.id)

        // Update user balance
        await this.updateUserBalance(pendingDeposit.user_id, transaction.amount)

        console.log(`Deposit confirmed: ${transaction.txHash} for user ${pendingDeposit.user_id}`)
      } else {
        // Create new deposit record (for direct deposits without pending record)
        const { data: newDeposit } = await this.supabase
          .from('transactions')
          .insert({
            user_id: null, // Will need to be manually assigned or use address mapping
            type: 'deposit',
            amount: transaction.amount,
            crypto_type: transaction.cryptoType,
            tx_hash: transaction.txHash,
            wallet_address: walletAddress,
            status: 'confirmed'
          })
          .select()
          .single()

        console.log(`New deposit detected: ${transaction.txHash}`)
      }
    } catch (error) {
      console.error('Error processing deposit:', error)
    }
  }

  // Update user account balance
  private async updateUserBalance(userId: string, amount: number): Promise<void> {
    try {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('account_balance')
        .eq('id', userId)
        .single()

      if (profile) {
        await this.supabase
          .from('profiles')
          .update({
            account_balance: profile.account_balance + amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
      }
    } catch (error) {
      console.error('Error updating user balance:', error)
    }
  }

  // Get deposit status
  async getDepositStatus(txHash: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed'
    confirmations: number
    requiredConfirmations: number
  }> {
    try {
      // This would check the blockchain for transaction status
      // Implementation depends on the specific blockchain API
      return {
        status: 'pending',
        confirmations: 0,
        requiredConfirmations: 3
      }
    } catch (error) {
      console.error('Error getting deposit status:', error)
      return {
        status: 'failed',
        confirmations: 0,
        requiredConfirmations: 3
      }
    }
  }
}

export default BlockchainMonitor
export type { DepositTransaction }
