# 🚀 Automatic Deposit System Setup Guide

## Overview

Your CryptoEarn Pro platform now includes a comprehensive automatic deposit detection system that:

- ✅ **Monitors blockchain transactions** in real-time
- ✅ **Automatically confirms deposits** when sufficient confirmations are reached
- ✅ **Updates user balances** instantly upon confirmation
- ✅ **Sends notifications** to users about deposit status
- ✅ **Supports multiple cryptocurrencies** (BTC, ETH, USDT)
- ✅ **Provides real-time tracking** with confirmation progress
- ✅ **Includes webhook support** for external monitoring services

## 🔧 Setup Instructions

### 1. Database Setup

Run the SQL migration in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of database-auto-deposits.sql
```

This creates:
- `notifications` table for user notifications
- `wallet_addresses` table for address mapping
- `deposit_monitoring_log` table for tracking
- Automatic triggers for deposit confirmations

### 2. Environment Variables

Add these to your deployment platform (Vercel/Netlify):

```env
# Existing variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# New variables for auto deposits
CRON_SECRET=your_random_secret_for_cron_jobs
ETHERSCAN_API_KEY=your_etherscan_api_key_optional
WEBHOOK_SECRET=your_webhook_secret_optional
```

### 3. API Keys Setup

#### Etherscan API (for ETH/USDT monitoring)
1. Go to [etherscan.io/apis](https://etherscan.io/apis)
2. Create free account and get API key
3. Add to `ETHERSCAN_API_KEY` environment variable

#### Blockchain Monitoring Services (Optional)
For production, consider using:
- **BlockCypher** - Bitcoin monitoring
- **Alchemy** - Ethereum monitoring  
- **Moralis** - Multi-chain monitoring

## 🎯 Features Included

### 1. Automatic Detection
- Monitors Bitcoin addresses via Blockstream API
- Monitors Ethereum/USDT via Etherscan API
- Configurable confirmation requirements (BTC: 3, ETH: 12)
- Real-time status updates

### 2. User Interface
- **AutoDepositTracker** component shows live deposit status
- Real-time confirmation progress bars
- Transaction hash links to blockchain explorers
- Copy-to-clipboard functionality
- Auto-refresh every 30 seconds

### 3. API Endpoints

#### `/api/deposits/monitor` (POST)
Manual deposit monitoring for specific addresses
```json
{
  "walletAddress": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
  "cryptoType": "BTC",
  "userId": "user-uuid"
}
```

#### `/api/deposits/status` (POST)
Check status of specific deposit
```json
{
  "depositId": "deposit-uuid"
}
```

#### `/api/webhooks/deposit` (POST)
Webhook endpoint for external monitoring services

### 4. Cron Jobs
- Runs every 5 minutes via Vercel Cron
- Monitors all pending deposits automatically
- Updates confirmations and processes confirmed deposits

## 🔄 How It Works

### User Flow:
1. User initiates deposit on wallet page
2. System creates pending transaction record
3. User sends crypto to provided address
4. **Automatic monitoring begins:**
   - Cron job checks blockchain every 5 minutes
   - Real-time UI updates every 30 seconds
   - Webhooks provide instant notifications (if configured)

### Confirmation Process:
1. Transaction detected on blockchain
2. Confirmation count tracked
3. When required confirmations reached:
   - Transaction status → "confirmed"
   - User balance updated automatically
   - Notification sent to user
   - UI updates in real-time

## 🛠️ Configuration Options

### Confirmation Requirements
Edit in `blockchain-monitor.ts`:
```typescript
const requiredConfirmations = cryptoType === 'BTC' ? 3 : 12
```

### Monitoring Frequency
Edit in `vercel.json`:
```json
"crons": [
  {
    "path": "/api/deposits/monitor",
    "schedule": "*/5 * * * *"  // Every 5 minutes
  }
]
```

### Supported Networks
- **Bitcoin**: Mainnet & Testnet
- **Ethereum**: Mainnet & Sepolia Testnet  
- **USDT**: ERC-20 on Ethereum

## 🚀 Deployment

### Vercel (Recommended)
1. Deploy your app to Vercel
2. Add environment variables in Vercel dashboard
3. Cron jobs will automatically start running
4. Monitor logs in Vercel Functions tab

### Manual Testing
```bash
# Test deposit monitoring
curl -X POST http://localhost:3000/api/deposits/monitor \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa","cryptoType":"BTC"}'

# Check deposit status  
curl -X POST http://localhost:3000/api/deposits/status \
  -H "Content-Type: application/json" \
  -d '{"depositId":"your-deposit-id"}'
```

## 📊 Monitoring & Analytics

### Admin Panel Integration
The automatic deposit system integrates with your existing admin panel:
- View all detected transactions
- Monitor confirmation status
- Manual override capabilities
- Deposit analytics and reporting

### Logging
All deposit monitoring activities are logged in:
- `deposit_monitoring_log` table
- Vercel Function logs
- Console logs for debugging

## 🔐 Security Features

- **Webhook signature verification** prevents unauthorized access
- **Cron job authentication** via secret token
- **RLS policies** ensure users only see their own data
- **Input validation** on all API endpoints
- **Rate limiting** on monitoring endpoints

## 🎉 Benefits

### For Users:
- ✅ **Instant confirmation** when deposits are detected
- ✅ **Real-time progress tracking** with confirmation counts
- ✅ **Automatic balance updates** - no waiting for admin approval
- ✅ **Push notifications** about deposit status
- ✅ **Better user experience** with live updates

### For Admins:
- ✅ **Reduced manual work** - no need to manually confirm deposits
- ✅ **Faster processing** - deposits confirmed within minutes
- ✅ **Better accuracy** - eliminates human error
- ✅ **Comprehensive logging** for audit trails
- ✅ **Scalable solution** handles high transaction volumes

## 🚀 Ready to Launch!

Your automatic deposit system is now fully configured and ready for production use. Users will experience seamless, automatic deposit confirmations that significantly improve the platform's user experience.

The system is designed to be:
- **Reliable** - Multiple monitoring methods ensure no deposits are missed
- **Fast** - Real-time updates and quick confirmations
- **Secure** - Multiple layers of validation and security
- **Scalable** - Handles growing transaction volumes efficiently

Deploy your updated platform and enjoy the enhanced deposit experience!
