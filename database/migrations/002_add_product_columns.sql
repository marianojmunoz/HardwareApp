-- Migration: Add missing columns to products table
-- Run this in Supabase SQL Editor

-- Add categoria column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='products' AND column_name='categoria') THEN
        ALTER TABLE products ADD COLUMN categoria TEXT;
    END IF;
END $$;

-- Add sub_categoria column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='products' AND column_name='sub_categoria') THEN
        ALTER TABLE products ADD COLUMN sub_categoria TEXT;
    END IF;
END $$;

-- Add precio_total column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='products' AND column_name='precio_total') THEN
        ALTER TABLE products ADD COLUMN precio_total DECIMAL(10, 2);
    END IF;
END $$;

-- Add es_nuevo column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='products' AND column_name='es_nuevo') THEN
        ALTER TABLE products ADD COLUMN es_nuevo TEXT DEFAULT 'NO';
    END IF;
END $$;

-- Add codigo_arrobapc column if it doesn't exist (stores original Excel codigo)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='products' AND column_name='codigo_arrobapc') THEN
        ALTER TABLE products ADD COLUMN codigo_arrobapc TEXT;
    END IF;
END $$;

-- Create index for faster searches by codigo and producto
CREATE INDEX IF NOT EXISTS idx_products_codigo_producto 
ON products(codigo, producto);

-- Update existing products to have es_nuevo = 'NO' if NULL
UPDATE products SET es_nuevo = 'NO' WHERE es_nuevo IS NULL;
