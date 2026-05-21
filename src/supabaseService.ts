/// <reference types="vite/client" />
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Lead } from './types';

// Storage keys for custom Supabase connection
const STORAGE_KEYS = {
  URL: 'crm_supabase_url',
  ANON_KEY: 'crm_supabase_anon_key',
  IS_ENABLED: 'crm_supabase_enabled'
};

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_KEYS.URL) || '';
  const anonKey = localStorage.getItem(STORAGE_KEYS.ANON_KEY) || '';
  const isEnabled = localStorage.getItem(STORAGE_KEYS.IS_ENABLED) !== 'false'; // default true if config exists
  return { url, anonKey, isEnabled };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string, isEnabled: boolean) {
  localStorage.setItem(STORAGE_KEYS.URL, url.trim());
  localStorage.setItem(STORAGE_KEYS.ANON_KEY, anonKey.trim());
  localStorage.setItem(STORAGE_KEYS.IS_ENABLED, String(isEnabled));
}

export function clearStoredSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEYS.URL);
  localStorage.removeItem(STORAGE_KEYS.ANON_KEY);
  localStorage.setItem(STORAGE_KEYS.IS_ENABLED, 'false');
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  // 1. Check environment variables
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envAnonKey) {
    const configKey = `env:${envUrl}:${envAnonKey}`;
    if (cachedClient && cachedConfigKey === configKey) {
      return cachedClient;
    }
    try {
      cachedClient = createClient(envUrl, envAnonKey);
      cachedConfigKey = configKey;
      return cachedClient;
    } catch (e) {
      console.error("Erro ao inicializar Supabase com variáveis de ambiente:", e);
    }
  }

  // 2. Fallback to localStorage custom configurations
  const stored = getStoredSupabaseConfig();
  if (stored.url && stored.anonKey && stored.isEnabled) {
    const configKey = `local:${stored.url}:${stored.anonKey}`;
    if (cachedClient && cachedConfigKey === configKey) {
      return cachedClient;
    }
    try {
      cachedClient = createClient(stored.url, stored.anonKey);
      cachedConfigKey = configKey;
      return cachedClient;
    } catch (e) {
      console.error("Erro ao inicializar Supabase com localStorage:", e);
    }
  }

  return null;
}

// SQL helper string to display in UI for creating the table
export const SUPABASE_SQL_SETUP = `-- 1. Crie a tabela de leads/oportunidades
create table if not exists public.crm_leads (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    client_name text not null,
    client_email text,
    client_phone text,
    val numeric default 0,
    status text not null check (status in ('Não iniciado', 'Em Andamento', 'Finalizado')),
    priority text not null check (priority in ('Baixa', 'Média', 'Alta')),
    notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Habilite políticas de acesso público total (para fins de teste/CRM simples)
alter table public.crm_leads enable row level security;

create policy "Permitir acesso público total para demonstração"
on public.crm_leads for all
using (true)
with check (true);

-- 3. IMPORTANTE: Habilite o Realtime para esta tabela no painel do Supabase:
-- Database -> Publications -> supabase_realtime -> Toggle crm_leads on,
-- ou execute o comando abaixo:
alter publication supabase_realtime add table crm_leads;`;
