export interface Lead {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  val: number; // deal value
  status: 'Não iniciado' | 'Em Andamento' | 'Finalizado';
  priority: 'Baixa' | 'Média' | 'Alta';
  notes: string;
  created_at: string;
  updated_at?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}
