-- Auto Deposit System Database Extensions
-- Run this SQL in your Supabase SQL Editor

-- Create notifications table for deposit confirmations
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- Add RLS policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Add wallet address mapping table for better deposit tracking
CREATE TABLE IF NOT EXISTS wallet_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crypto_type VARCHAR(10) NOT NULL,
  wallet_address VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for wallet addresses
CREATE INDEX IF NOT EXISTS idx_wallet_addresses_user_id ON wallet_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_addresses_crypto_type ON wallet_addresses(crypto_type);
CREATE INDEX IF NOT EXISTS idx_wallet_addresses_address ON wallet_addresses(wallet_address);

-- Add RLS policies for wallet addresses
ALTER TABLE wallet_addresses ENABLE ROW LEVEL SECURITY;

-- Users can view their own wallet addresses
CREATE POLICY "Users can view own wallet addresses" ON wallet_addresses
  FOR SELECT USING (auth.uid() = user_id);

-- Add deposit monitoring log table
CREATE TABLE IF NOT EXISTS deposit_monitoring_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address VARCHAR(255) NOT NULL,
  crypto_type VARCHAR(10) NOT NULL,
  tx_hash VARCHAR(255),
  amount DECIMAL(20, 8),
  confirmations INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'detected',
  blockchain_data JSONB DEFAULT '{}',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for monitoring log
CREATE INDEX IF NOT EXISTS idx_deposit_log_wallet ON deposit_monitoring_log(wallet_address);
CREATE INDEX IF NOT EXISTS idx_deposit_log_tx_hash ON deposit_monitoring_log(tx_hash);
CREATE INDEX IF NOT EXISTS idx_deposit_log_status ON deposit_monitoring_log(status);
CREATE INDEX IF NOT EXISTS idx_deposit_log_created_at ON deposit_monitoring_log(created_at DESC);

-- Add automatic deposit detection trigger function
CREATE OR REPLACE FUNCTION handle_deposit_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- When a transaction status changes to 'confirmed' and it's a deposit
  IF NEW.status = 'confirmed' AND OLD.status = 'pending' AND NEW.type = 'deposit' THEN
    -- Insert notification
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.user_id,
      'deposit_confirmed',
      'Deposit Confirmed',
      'Your ' || NEW.crypto_type || ' deposit of ' || NEW.amount || ' has been confirmed and added to your balance.',
      jsonb_build_object(
        'transaction_id', NEW.id,
        'amount', NEW.amount,
        'crypto_type', NEW.crypto_type,
        'tx_hash', NEW.tx_hash
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic notifications
DROP TRIGGER IF EXISTS trigger_deposit_confirmation ON transactions;
CREATE TRIGGER trigger_deposit_confirmation
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION handle_deposit_confirmation();

-- Add updated_at trigger for notifications
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_wallet_addresses_updated_at ON wallet_addresses;
CREATE TRIGGER update_wallet_addresses_updated_at
  BEFORE UPDATE ON wallet_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample wallet addresses for testing (optional)
-- You can customize these addresses for your platform
INSERT INTO wallet_addresses (user_id, crypto_type, wallet_address) VALUES
  -- These are example addresses - replace with your actual platform addresses
  (NULL, 'BTC', '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'),
  (NULL, 'ETH', '0x742d35Cc6634C0532925a3b8D4e6e3a8b0a3b0a3'),
  (NULL, 'USDT', '0x742d35Cc6634C0532925a3b8D4e6e3a8b0a3b0a3')
ON CONFLICT (wallet_address) DO NOTHING;

-- Grant necessary permissions
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON wallet_addresses TO authenticated;
GRANT ALL ON deposit_monitoring_log TO authenticated;
