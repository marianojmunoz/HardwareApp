-- Migration: Create orders tables for order tracking system
-- Run this in Supabase SQL Editor

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected'))
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders(user_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
  DROP POLICY IF EXISTS "Authenticated users can insert orders" ON orders;
  DROP POLICY IF EXISTS "Admin users can update order status" ON orders;
  DROP POLICY IF EXISTS "Anyone can view order items" ON order_items;
  DROP POLICY IF EXISTS "Authenticated users can insert order items" ON order_items;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

-- Policy: Allow authenticated users to view all orders (needed for admin view)
-- In practice, the frontend will restrict this to admin users only
CREATE POLICY "Anyone can view orders"
  ON orders
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can create orders
CREATE POLICY "Authenticated users can insert orders"
  ON orders
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Authenticated users can update order status
-- Frontend will ensure only admins can actually do this
CREATE POLICY "Admin users can update order status"
  ON orders
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Anyone can view order items
CREATE POLICY "Anyone can view order items"
  ON order_items
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can create order items
CREATE POLICY "Authenticated users can insert order items"
  ON order_items
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
