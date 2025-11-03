-- Trini4ex Database Setup
-- Run this SQL in your Supabase SQL Editor

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.investment_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE public.payout_status AS ENUM ('pending', 'completed');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create investments table
CREATE TABLE public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    contract_quantity INTEGER NOT NULL CHECK (contract_quantity IN (1, 2, 3, 4, 5, 10, 15)),
    total_investment_ttd DECIMAL(10, 2) NOT NULL,
    monthly_payout_ttd DECIMAL(10, 2) NOT NULL,
    monthly_fee_ttd DECIMAL(10, 2) NOT NULL,
    auto_renew_enabled BOOLEAN NOT NULL DEFAULT false,
    can_disable_auto_renew BOOLEAN NOT NULL DEFAULT false,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status investment_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Create payouts table
CREATE TABLE public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount_ttd DECIMAL(10, 2) NOT NULL,
    fee_deducted_ttd DECIMAL(10, 2) NOT NULL,
    net_amount_ttd DECIMAL(10, 2) NOT NULL,
    payout_date DATE NOT NULL,
    status payout_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for investments
CREATE POLICY "Users can view own investments"
  ON public.investments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own investments"
  ON public.investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments"
  ON public.investments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all investments"
  ON public.investments FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all investments"
  ON public.investments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for payouts
CREATE POLICY "Users can view own payouts"
  ON public.payouts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payouts"
  ON public.payouts FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all payouts"
  ON public.payouts FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Grant admin role to theronmurren@gmail.com
-- Run this after the user signs up
-- UPDATE public.user_roles SET role = 'admin' WHERE user_id = (SELECT id FROM auth.users WHERE email = 'theronmurren@gmail.com');

-- Create indexes for performance
CREATE INDEX idx_investments_user_id ON public.investments(user_id);
CREATE INDEX idx_investments_status ON public.investments(status);
CREATE INDEX idx_payouts_user_id ON public.payouts(user_id);
CREATE INDEX idx_payouts_investment_id ON public.payouts(investment_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
