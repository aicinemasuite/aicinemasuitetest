import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export interface Profile {
  id: string;
  email: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'PURCHASE' | 'USAGE' | 'BONUS' | 'REFUND';
  description: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  created_at: string;
}

// Get current user profile with credits
export const getUserProfile = async (): Promise<Profile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

// Deduct credit (server-side function call)
export const deductCredit = async (description: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc('deduct_credit', {
    p_user_id: user.id,
    p_description: description
  });

  if (error) {
    console.error('Error deducting credit:', error);
    return false;
  }

  return data === true;
};

// Add credits after payment
export const addCredits = async (
  amount: number,
  razorpayPaymentId: string,
  razorpayOrderId: string
): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase.rpc('add_credits', {
    p_user_id: user.id,
    p_amount: amount,
    p_razorpay_payment_id: razorpayPaymentId,
    p_razorpay_order_id: razorpayOrderId
  });

  if (error) {
    console.error('Error adding credits:', error);
    return false;
  }

  return data === true;
};

// Get credit transaction history
export const getCreditTransactions = async (): Promise<CreditTransaction[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data || [];
};
