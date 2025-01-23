-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    username TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create oauth_connections table
CREATE TABLE oauth_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider)
);

-- First, drop any existing objects to avoid conflicts
DROP TABLE IF EXISTS public.wallet_connections CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;

-- Create the updated_at trigger function in public schema
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create wallet_connections table in public schema
CREATE TABLE public.wallet_connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_type VARCHAR(50) NOT NULL,
    wallet_address TEXT NOT NULL,
    connected BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT wallet_connections_user_wallet_unique UNIQUE (user_id, wallet_type)
);

-- Add RLS policies
ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can read own wallet connections"
    ON public.wallet_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet connections"
    ON public.wallet_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet connections"
    ON public.wallet_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallet connections"
    ON public.wallet_connections FOR DELETE
    USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_wallet_connections_updated_at
    BEFORE UPDATE ON public.wallet_connections
    FOR EACH ROW
    EXECUTE PROCEDURE public.update_updated_at_column();

-- Create ai_chats table
CREATE TABLE ai_chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chat_type TEXT NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    github_repo TEXT,
    deployment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users policies
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (
        auth.uid() = id OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (
        auth.uid() = id OR
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can insert own profile"
    ON users FOR INSERT
    WITH CHECK (
        auth.uid() = id OR
        auth.role() = 'service_role'
    );

-- Add a policy for service role updates
CREATE POLICY "Service role can manage users"
    ON users
    USING (auth.jwt()->>'role' = 'service_role');

-- OAuth connections policies
CREATE POLICY "Users can view own oauth connections"
    ON oauth_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own oauth connections"
    ON oauth_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own oauth connections"
    ON oauth_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own oauth connections"
    ON oauth_connections FOR DELETE
    USING (auth.uid() = user_id);

-- Wallet connections policies
CREATE POLICY "Users can view own wallet connections"
    ON public.wallet_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet connections"
    ON public.wallet_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet connections"
    ON public.wallet_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallet connections"
    ON public.wallet_connections FOR DELETE
    USING (auth.uid() = user_id);

-- AI chats policies
CREATE POLICY "Users can view own chats"
    ON ai_chats FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chats"
    ON ai_chats FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chats"
    ON ai_chats FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chats"
    ON ai_chats FOR DELETE
    USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- Add this policy to allow users to delete their own data
CREATE POLICY "Users can delete own profile"
    ON users FOR DELETE
    USING (
        auth.uid() = id OR
        auth.role() = 'service_role'
    );

-- Create user_wallets table
CREATE TABLE user_wallets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    wallet_type TEXT NOT NULL,
    wallet_address TEXT,
    connected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::TEXT, NOW()) NOT NULL,
    UNIQUE(user_id, wallet_type)
);

-- Add RLS policies
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wallet connections"
    ON user_wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wallet connections"
    ON user_wallets FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wallet connections"
    ON user_wallets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_wallets_updated_at
    BEFORE UPDATE ON user_wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wallet_connections_updated_at
    BEFORE UPDATE ON wallet_connections
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Add proper RLS policies
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own wallet connections"
    ON wallet_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet connections"
    ON wallet_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet connections"
    ON wallet_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallet connections"
    ON wallet_connections FOR DELETE
    USING (auth.uid() = user_id);

-- Add connected column to wallet_connections if it doesn't exist
ALTER TABLE wallet_connections 
ADD COLUMN IF NOT EXISTS connected BOOLEAN DEFAULT true; 

-- Drop and recreate vercel_connections table to ensure clean schema
DROP TABLE IF EXISTS vercel_connections;

-- Create vercel_connections table with proper schema
CREATE TABLE vercel_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vercel_id TEXT NOT NULL,
    username TEXT NOT NULL,
    access_token TEXT NOT NULL,
    connected BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT vercel_connections_user_unique UNIQUE (user_id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_vercel_connections_updated_at
    BEFORE UPDATE ON vercel_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for vercel_connections
ALTER TABLE vercel_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own vercel connections"
    ON vercel_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vercel connections"
    ON vercel_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vercel connections"
    ON vercel_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vercel connections"
    ON vercel_connections FOR DELETE
    USING (auth.uid() = user_id);

-- Add connected column to wallet_connections if it doesn't exist
ALTER TABLE wallet_connections 
ADD COLUMN IF NOT EXISTS connected BOOLEAN DEFAULT true; 

-- Create github_connections table
CREATE TABLE github_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    github_id TEXT NOT NULL,
    username TEXT NOT NULL,
    access_token TEXT NOT NULL,
    connected BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT github_connections_user_unique UNIQUE (user_id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_github_connections_updated_at
    BEFORE UPDATE ON github_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for github_connections
ALTER TABLE github_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own github connections"
    ON github_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own github connections"
    ON github_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own github connections"
    ON github_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own github connections"
    ON github_connections FOR DELETE
    USING (auth.uid() = user_id); 

-- Create supabase_connections table
CREATE TABLE supabase_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id TEXT NOT NULL,
    org_name TEXT NOT NULL,
    access_token TEXT NOT NULL,
    connected BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT supabase_connections_user_unique UNIQUE (user_id)
);

-- Add trigger for updated_at
CREATE TRIGGER update_supabase_connections_updated_at
    BEFORE UPDATE ON supabase_connections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies for supabase_connections
ALTER TABLE supabase_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own supabase connections"
    ON supabase_connections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own supabase connections"
    ON supabase_connections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own supabase connections"
    ON supabase_connections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own supabase connections"
    ON supabase_connections FOR DELETE
    USING (auth.uid() = user_id); 