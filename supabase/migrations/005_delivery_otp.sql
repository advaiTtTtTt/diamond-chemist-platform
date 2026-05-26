-- Migration: Add delivery OTP support to orders table
-- Run this in Supabase SQL Editor

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_otp TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS otp_verified BOOLEAN DEFAULT FALSE;

-- Index for fast OTP lookup
CREATE INDEX IF NOT EXISTS idx_orders_delivery_otp ON public.orders(delivery_otp);
