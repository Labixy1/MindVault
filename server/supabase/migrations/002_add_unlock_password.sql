-- Add unlock_password column to users table (hashed)
ALTER TABLE users ADD COLUMN unlock_password TEXT;
