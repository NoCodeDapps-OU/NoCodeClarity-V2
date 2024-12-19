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

-- Create wallet_connections table
CREATE TABLE wallet_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    wallet_address TEXT NOT NULL,
    wallet_type TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, wallet_address)
);

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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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
ALTER TABLE wallet_connections ENABLE ROW LEVEL SECURITY;
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