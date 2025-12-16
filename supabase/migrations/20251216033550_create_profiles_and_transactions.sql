/*
  # Create Profiles and Credit System

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `credits` (integer, default 3 free credits)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `credit_transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `amount` (integer, can be negative for deductions)
      - `type` (text: 'PURCHASE', 'USAGE', 'BONUS')
      - `description` (text)
      - `razorpay_payment_id` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can read their own profile
    - Users can read their own transactions
    - Only authenticated users can access data
    
  3. Functions
    - Auto-create profile on signup
    - Function to deduct credits safely
    - Function to add credits after payment
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  credits integer DEFAULT 3 NOT NULL CHECK (credits >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create credit transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  type text NOT NULL CHECK (type IN ('PURCHASE', 'USAGE', 'BONUS', 'REFUND')),
  description text NOT NULL,
  razorpay_payment_id text,
  razorpay_order_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile credits"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policies for credit_transactions
CREATE POLICY "Users can read own transactions"
  ON credit_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON credit_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, credits)
  VALUES (
    NEW.id,
    NEW.email,
    3  -- 3 free credits for new users
  );
  
  -- Record the initial bonus
  INSERT INTO public.credit_transactions (user_id, amount, type, description)
  VALUES (
    NEW.id,
    3,
    'BONUS',
    'Welcome bonus: 3 free credits'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Safely deduct credits (atomic operation)
CREATE OR REPLACE FUNCTION public.deduct_credit(
  p_user_id uuid,
  p_description text
)
RETURNS boolean AS $$
DECLARE
  current_credits integer;
BEGIN
  -- Lock the row and get current credits
  SELECT credits INTO current_credits
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;
  
  -- Check if user has enough credits
  IF current_credits < 1 THEN
    RETURN false;
  END IF;
  
  -- Deduct credit
  UPDATE profiles
  SET credits = credits - 1,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, type, description)
  VALUES (p_user_id, -1, 'USAGE', p_description);
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Add credits after purchase
CREATE OR REPLACE FUNCTION public.add_credits(
  p_user_id uuid,
  p_amount integer,
  p_razorpay_payment_id text,
  p_razorpay_order_id text
)
RETURNS boolean AS $$
BEGIN
  -- Add credits
  UPDATE profiles
  SET credits = credits + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    user_id,
    amount,
    type,
    description,
    razorpay_payment_id,
    razorpay_order_id
  )
  VALUES (
    p_user_id,
    p_amount,
    'PURCHASE',
    format('Purchased %s credits', p_amount),
    p_razorpay_payment_id,
    p_razorpay_order_id
  );
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
