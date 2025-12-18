-- Migration 003: Admin Roles and Security Hardening
-- This migration implements proper authorization and data privacy
-- Run this in Supabase SQL Editor
-- SAFE TO RE-RUN: This script is idempotent

-- ============================================================================
-- STEP 1: CREATE ADMIN USERS TABLE
-- ============================================================================

-- Create admin_users table to store authorized admin emails
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Insert your admin emails (UPDATE THESE IF NEEDED)
INSERT INTO admin_users (email) VALUES
  ('mariano.j.munoz.1985@gmail.com'),
  ('mariano.j.munoz@hotmail.com')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policy first
DROP POLICY IF EXISTS "Only admins can view admin users" ON admin_users;

-- Only admins can view admin list
CREATE POLICY "Only admins can view admin users"
  ON admin_users
  FOR SELECT
  USING (
    email IN (SELECT email FROM admin_users WHERE email = auth.jwt()->>'email')
  );

-- ============================================================================
-- STEP 2: CREATE ADMIN CHECK FUNCTION
-- ============================================================================

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = auth.jwt()->>'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 3: UPDATE PRODUCTS TABLE POLICIES (CRITICAL FIX)
-- ============================================================================

-- Drop ALL existing policies for products
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
DROP POLICY IF EXISTS "Only admins can insert products" ON products;
DROP POLICY IF EXISTS "Only admins can update products" ON products;
DROP POLICY IF EXISTS "Only admins can delete products" ON products;

-- NEW SECURE POLICIES: Only admins can modify products
CREATE POLICY "Only admins can insert products"
  ON products
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update products"
  ON products
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Only admins can delete products"
  ON products
  FOR DELETE
  USING (is_admin());

-- ============================================================================
-- STEP 4: UPDATE ORDERS TABLE POLICIES (PRIVACY FIX)
-- ============================================================================

-- Drop ALL existing policies for orders
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
DROP POLICY IF EXISTS "Admin users can update order status" ON orders;
DROP POLICY IF EXISTS "Only admins can update order status" ON orders;
DROP POLICY IF EXISTS "Users can view own orders, admins can view all" ON orders;

-- NEW SECURE POLICIES: Users see only their orders, admins see all
CREATE POLICY "Users can view own orders, admins can view all"
  ON orders
  FOR SELECT
  USING (
    is_admin() OR user_email = auth.jwt()->>'email'
  );

-- Only admins can update order status
CREATE POLICY "Only admins can update order status"
  ON orders
  FOR UPDATE
  USING (is_admin());

-- ============================================================================
-- STEP 5: UPDATE ORDER_ITEMS TABLE POLICIES
-- ============================================================================

-- Drop ALL existing policies for order_items
DROP POLICY IF EXISTS "Anyone can view order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own order items, admins can view all" ON order_items;

-- NEW SECURE POLICY: Users see only items from their orders
CREATE POLICY "Users can view own order items, admins can view all"
  ON order_items
  FOR SELECT
  USING (
    is_admin() OR 
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_email = auth.jwt()->>'email'
    )
  );

-- ============================================================================
-- STEP 6: AUDIT LOGGING
-- ============================================================================

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  user_email TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policy
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_log;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs"
  ON audit_log
  FOR SELECT
  USING (is_admin());

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log (table_name, action, user_email, old_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.jwt()->>'email', row_to_json(OLD));
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_log (table_name, action, user_email, old_data, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.jwt()->>'email', row_to_json(OLD), row_to_json(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log (table_name, action, user_email, new_data)
    VALUES (TG_TABLE_NAME, TG_OP, auth.jwt()->>'email', row_to_json(NEW));
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to products table
DROP TRIGGER IF EXISTS audit_products ON products;
CREATE TRIGGER audit_products
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- Add audit triggers to orders table
DROP TRIGGER IF EXISTS audit_orders ON orders;
CREATE TRIGGER audit_orders
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_trigger();

-- ============================================================================
-- STEP 7: VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify the migration worked:

-- Check admin users
-- SELECT * FROM admin_users;

-- Test is_admin function (should return true for your email)
-- SELECT is_admin();

-- Check all policies
-- SELECT schemaname, tablename, policyname FROM pg_policies 
-- WHERE tablename IN ('products', 'orders', 'order_items', 'admin_users');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary of changes:
-- ✅ Created admin_users table with your emails
-- ✅ Created is_admin() function for role checking
-- ✅ Updated products policies: Only admins can INSERT/UPDATE/DELETE
-- ✅ Updated orders policies: Users see only their orders
-- ✅ Updated order_items policies: Users see only their items
-- ✅ Added audit logging for all critical operations
-- ✅ All policies use backend validation (not frontend)
