import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/database.types';

type Tables = Database['public']['Tables'];

export type User = Tables['users']['Row'];
export type OAuthConnection = Tables['oauth_connections']['Row'];
export type WalletConnection = Tables['wallet_connections']['Row'];
export type AIChat = Tables['ai_chats']['Row'];
export type Project = Tables['projects']['Row'];

// User Profile operations
export async function getUserProfile(userId: string) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserProfile(userId: string, updates: Partial<User>) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// OAuth operations
export async function getOAuthConnections(userId: string) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('oauth_connections')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
}

export async function addOAuthConnection(connection: Omit<OAuthConnection, 'id' | 'created_at'>) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('oauth_connections')
    .insert(connection)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeOAuthConnection(userId: string, provider: string) {
  const supabase = createClientComponentClient<Database>();
  const { error } = await supabase
    .from('oauth_connections')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider);
  
  if (error) throw error;
}

// Wallet operations
export async function getWalletConnections(userId: string) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('wallet_connections')
    .select('*')
    .eq('user_id', userId);
  
  if (error) throw error;
  return data;
}

export async function addWalletConnection(connection: Omit<WalletConnection, 'id' | 'created_at'>) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('wallet_connections')
    .insert(connection)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeWalletConnection(userId: string, walletAddress: string) {
  const supabase = createClientComponentClient<Database>();
  const { error } = await supabase
    .from('wallet_connections')
    .delete()
    .eq('user_id', userId)
    .eq('wallet_address', walletAddress);
  
  if (error) throw error;
}

// AI Chat operations
export async function getAIChats(userId: string) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('ai_chats')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function addAIChat(chat: Omit<AIChat, 'id' | 'created_at'>) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('ai_chats')
    .insert(chat)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateAIChat(chatId: string, messages: AIChat['messages']) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('ai_chats')
    .update({ messages })
    .eq('id', chatId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Project operations
export async function getProjects(userId: string) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getProject(projectId: string) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createProject(project: Omit<Project, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProject(projectId: string, updates: Partial<Project>) {
  const supabase = createClientComponentClient<Database>();
  const { data, error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteProject(projectId: string) {
  const supabase = createClientComponentClient<Database>();
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);
  
  if (error) throw error;
} 