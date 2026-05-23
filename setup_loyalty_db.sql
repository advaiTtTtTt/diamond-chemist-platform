-- 1. Create profiles table
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT,
    referral_code TEXT UNIQUE NOT NULL,
    referred_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Allow public to insert (during signup)
CREATE POLICY "Allow public insert" ON profiles
    FOR INSERT WITH CHECK (true);

-- Allow public to read referral codes (for validation during signup)
CREATE POLICY "Allow public read referral codes" ON profiles
    FOR SELECT USING (true);


-- 2. Create points_ledger table
CREATE TABLE points_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL, -- 'referral_bonus', 'welcome_bonus', 'purchase', 'redeemed', 'expired'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own points
CREATE POLICY "Users can view own points" ON points_ledger
    FOR SELECT USING (auth.uid() = user_id);

-- Admins / Service Role can insert points (we will use functions/edge functions for this)
CREATE POLICY "Allow insert points" ON points_ledger
    FOR INSERT WITH CHECK (true); -- For demo purposes, open insert. In production, restrict to service role.

-- 3. Create a function to calculate active points balance
CREATE OR REPLACE FUNCTION get_active_points(customer_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_earned INTEGER;
    total_spent INTEGER;
BEGIN
    -- Sum of all positive points that haven't expired
    SELECT COALESCE(SUM(amount), 0) INTO total_earned
    FROM points_ledger
    WHERE user_id = customer_id 
    AND amount > 0 
    AND (expires_at IS NULL OR expires_at > now());

    -- Sum of all negative points (spent or manually expired)
    SELECT COALESCE(SUM(amount), 0) INTO total_spent
    FROM points_ledger
    WHERE user_id = customer_id 
    AND amount < 0;

    RETURN total_earned + total_spent;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
