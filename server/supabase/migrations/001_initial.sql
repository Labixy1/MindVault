-- Enable RLS (Row Level Security)
alter table if exists users enable row level security;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Allow anyone to insert into users table during registration
CREATE POLICY "Anyone can insert users" ON users
    FOR INSERT WITH CHECK (true);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subcategories TEXT[] DEFAULT '{}',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can only access their own categories
CREATE POLICY "Users can CRUD own categories" ON categories
    FOR ALL USING (auth.uid() = user_id);

-- Allow anyone to insert categories (for default categories during registration)
CREATE POLICY "Anyone can insert categories" ON categories
    FOR INSERT WITH CHECK (true);

-- Create knowledge_blocks table
CREATE TABLE IF NOT EXISTS knowledge_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    remarks TEXT DEFAULT '',
    category TEXT NOT NULL,
    subcategory TEXT DEFAULT '',
    view_count INTEGER DEFAULT 0,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on knowledge_blocks
ALTER TABLE knowledge_blocks ENABLE ROW LEVEL SECURITY;

-- Users can only access their own knowledge blocks
CREATE POLICY "Users can CRUD own knowledge blocks" ON knowledge_blocks
    FOR ALL USING (auth.uid() = user_id);

-- Create prompts table
CREATE TABLE IF NOT EXISTS prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    original_prompt TEXT NOT NULL,
    fields JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on prompts
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own prompts
CREATE POLICY "Users can CRUD own prompts" ON prompts
    FOR ALL USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_blocks_updated_at
    BEFORE UPDATE ON knowledge_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
