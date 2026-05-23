-- 1. Create the Database Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    new_ref_code TEXT;
    referrer_id UUID;
    user_name TEXT;
    provided_ref_code TEXT;
BEGIN
    -- Extract metadata passed from the React frontend during signup
    user_name := new.raw_user_meta_data->>'full_name';
    provided_ref_code := new.raw_user_meta_data->>'referral_code';

    -- Generate a unique referral code for the new user (First 3 letters of name + 4 random digits)
    new_ref_code := UPPER(SUBSTRING(COALESCE(user_name, 'DIA') FROM 1 FOR 3)) || FLOOR(RANDOM() * 9000 + 1000)::TEXT;
    
    -- Check if they provided a valid referral code from a friend
    IF provided_ref_code IS NOT NULL AND provided_ref_code != '' THEN
        SELECT id INTO referrer_id FROM public.profiles WHERE referral_code = UPPER(provided_ref_code);
    END IF;

    -- Securely insert the new profile
    INSERT INTO public.profiles (id, full_name, phone, referral_code, referred_by)
    VALUES (
        new.id, 
        user_name,
        new.raw_user_meta_data->>'phone',
        new_ref_code,
        referrer_id
    );

    -- If a valid referrer was found, give the new user their 20 Point Welcome Bonus!
    IF referrer_id IS NOT NULL THEN
        INSERT INTO public.points_ledger (user_id, amount, transaction_type, expires_at)
        VALUES (new.id, 20, 'welcome_bonus', now() + interval '45 days');
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the Trigger to the Supabase Auth system
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
