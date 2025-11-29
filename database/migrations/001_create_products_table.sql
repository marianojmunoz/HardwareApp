-- Migration: Create products table with all required fields
-- Run this in Supabase SQL Editor

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  producto TEXT NOT NULL,
  garantia INTEGER DEFAULT 0,
  precio_publico DECIMAL(10, 2) NOT NULL,
  precio_gremio DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_codigo ON products(codigo);
CREATE INDEX IF NOT EXISTS idx_products_producto ON products USING gin(to_tsvector('spanish', producto));
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (ignore errors if they don't exist)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view products" ON products;
  DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
  DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
  DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

-- Policy: Anyone can view products (public access)
CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can insert products
CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated users can update products
CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated users can delete products
CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop if exist)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
EXCEPTION WHEN undefined_table THEN
  NULL;
END $$;

CREATE POLICY "Anyone can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated'
  );
