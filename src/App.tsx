import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Lead } from './types';
import { getSupabaseClient, getStoredSupabaseConfig, SUPABASE_SQL_SETUP } from './supabaseService';
import DashboardStats from './components/DashboardStats';
import LeadCard from './components/LeadCard';
import LeadModal from './components/LeadModal';
import SupabaseConfigModal from './components/SupabaseConfigModal';
import FilterBar from './components/FilterBar';
import { 
  Plus, 
  HelpCircle, 
  Database, 
  Info, 
  Copy, 
  Check, 
  AlertTriangle,
  FolderKanban,
  ExternalLink,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const INITIAL_DEMO_LEADS: Lead[] = [
  {
    id: "demo-1",
    title: "Venda de Licenças SaaS",
    client_name: "Fintech Soluções S/A",
    client_email: "compras@fintechsolucoes.com",
    client_phone: "(11) 98122-3849",
    val: 15400,
    status: "Não iniciado",
    priority: "Média",
    notes: "Primeiro contato efetuado na feira de tecnologia. Aguardam material institucional.",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "demo-2",
    title: "Desenvolvimento de App Mobile",
    client_name: "Clínica Saúde & Vida",
    client_email: "ti@saudevida.com.br",
    client_phone: "(21) 97531-8642",
    val: 45000,
    status: "Em Andamento",
    priority: "Alta",
    notes: "Apresentamos o escopo técnico. Estão analisando o orçamento no comitê de diretoria.",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "demo-3",
    title: "Consultoria de Processos",
    client_name: "Logística Expressa",
    client_email: "diretoria@logisticaexp.com.br",
    client_phone: "(19) 3211-9080",
    val: 8500,
    status: "Finalizado",
    priority: "Baixa",
    notes: "Contrato assinado, consultoria iniciada e primeira parcela faturada com sucesso.",
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "demo-4",
    title: "Treinamento Corporativo I.A.",
    client_name: "Vanguard Tech",
    client_email: "rh@vanguardtech.co",
    client_phone: "(41) 99888-1122",
    val: 12000,
    status: "Em Andamento",
    priority: "Média",
    notes: "Aguardando confirmação sobre os tópicos de LLM e custos de infraestrutura.",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "demo-5",
    title: "Migração de Banco de Dados",
    client_name: "Supermercados Baratão",
    client_email: "ti@superbaratao.com.br",
    client_phone: "(31) 3455-8800",
    val: 31000,
    status: "Não iniciado",
    priority: "Alta",
    notes: "Risco de overload do sistema atual no final do mês. Urgente negociar a migração.",
    created_at: new Date().toISOString()
  }
];

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSupabaseLive, setIsSupabaseLive] = useState(false);
  const [isTableMissing, setIsTableMissing] = useState(false);
  
  // Custom Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('Todos');
  const [sortBy, setSortBy] = useState('recentes');

  // Modal toggles
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Lead['status'] | undefined>(undefined);
  
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Load and refresh leads from storage or Supabase
  const loadLeads = useCallback(async () => {
    setIsLoading(true);
    setIsTableMissing(false);
    
    const client = getSupabaseClient();
    
    if (client) {
      try {
        const { data, error } = await client
          .from('crm_leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn("Erro ao selecionar da tabela 'crm_leads':", error);
          if (error.code === '42P01') { // PostgreSQL code for table does not exist
            setIsTableMissing(true);
          }
          throw error;
        }

        if (data) {
          // Map database schema fields to typed React interface
          const mapped: Lead[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            client_name: item.client_name,
            client_email: item.client_email,
            client_phone: item.client_phone,
            val: Number(item.val || 0),
            status: item.status as Lead['status'],
            priority: item.priority as Lead['priority'],
            notes: item.notes || '',
            created_at: item.created_at,
            updated_at: item.updated_at
          }));
          setLeads(mapped);
          setIsSupabaseLive(true);
        }
      } catch (err) {
        setIsSupabaseLive(false);
        // Fallback to offline / localstorage data
        loadLeadsOffline();
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsSupabaseLive(false);
      loadLeadsOffline();
      setIsLoading(false);
    }
  }, []);

  const loadLeadsOffline = () => {
    const raw = localStorage.getItem('crm_leads_offline');
    if (raw) {
      try {
        setLeads(JSON.parse(raw));
      } catch {
        setLeads(INITIAL_DEMO_LEADS);
        localStorage.setItem('crm_leads_offline', JSON.stringify(INITIAL_DEMO_LEADS));
      }
    } else {
      setLeads(INITIAL_DEMO_LEADS);
      localStorage.setItem('crm_leads_offline', JSON.stringify(INITIAL_DEMO_LEADS));
    }
  };

  // Sync state with localstorage when in offline mode
  const saveOfflineLeads = (newLeads: Lead[]) => {
    setLeads(newLeads);
    localStorage.setItem('crm_leads_offline', JSON.stringify(newLeads));
  };

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  // Set up real-time sync with Supabase subscription if available
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client || !isSupabaseLive || isTableMissing) return;

    // Listen to changes in crm_leads table
    const channel = client
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'crm_leads' },
        (payload) => {
          console.log('Evento Supabase Realtime recebido:', payload);
          // Refetch leads to keep exact order and DB computed values, 
          // or merge changes locally for blazing speed:
          if (payload.eventType === 'INSERT') {
            const newItem = payload.new as any;
            const item: Lead = {
              id: newItem.id,
              title: newItem.title,
              client_name: newItem.client_name,
              client_email: newItem.client_email,
              client_phone: newItem.client_phone,
              val: Number(newItem.val || 0),
              status: newItem.status as Lead['status'],
              priority: newItem.priority as Lead['priority'],
              notes: newItem.notes || '',
              created_at: newItem.created_at,
              updated_at: newItem.updated_at
            };
            setLeads(current => {
              if (current.some(x => x.id === item.id)) return current;
              return [item, ...current];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedItem = payload.new as any;
            const item: Lead = {
              id: updatedItem.id,
              title: updatedItem.title,
              client_name: updatedItem.client_name,
              client_email: updatedItem.client_email,
              client_phone: updatedItem.client_phone,
              val: Number(updatedItem.val || 0),
              status: updatedItem.status as Lead['status'],
              priority: updatedItem.priority as Lead['priority'],
              notes: updatedItem.notes || '',
              created_at: updatedItem.created_at,
              updated_at: updatedItem.updated_at
            };
            setLeads(current => current.map(x => x.id === item.id ? item : x));
          } else if (payload.eventType === 'DELETE') {
            const idToDelete = (payload.old as any).id;
            setLeads(current => current.filter(x => x.id !== idToDelete));
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [isSupabaseLive, isTableMissing]);

  // Lead Actions (CRUD)
  const handleSaveLead = async (leadData: Omit<Lead, 'created_at' | 'updated_at'>) => {
    const isEdit = leads.some(l => l.id === leadData.id);
    const client = getSupabaseClient();

    if (isSupabaseLive && client) {
      try {
        if (isEdit) {
          const { error } = await client
            .from('crm_leads')
            .update({
              title: leadData.title,
              client_name: leadData.client_name,
              client_email: leadData.client_email,
              client_phone: leadData.client_phone,
              val: leadData.val,
              status: leadData.status,
              priority: leadData.priority,
              notes: leadData.notes,
              updated_at: new Date().toISOString()
            })
            .eq('id', leadData.id);

          if (error) throw error;
        } else {
          const { error } = await client
            .from('crm_leads')
            .insert({
              id: leadData.id,
              title: leadData.title,
              client_name: leadData.client_name,
              client_email: leadData.client_email,
              client_phone: leadData.client_phone,
              val: leadData.val,
              status: leadData.status,
              priority: leadData.priority,
              notes: leadData.notes,
              created_at: new Date().toISOString()
            });

          if (error) throw error;
        }
        
        // Let the realtime subscription or immediate recheck refresh the visual board
        loadLeads();
      } catch (err) {
        console.error("Supabase failed. Saving to local database fallback.", err);
        // Fallback local persistence
        saveLocalChanges(leadData, isEdit);
      }
    } else {
      saveLocalChanges(leadData, isEdit);
    }
  };

  const saveLocalChanges = (leadData: Omit<Lead, 'created_at' | 'updated_at'>, isEdit: boolean) => {
    let updatedList: Lead[];
    if (isEdit) {
      updatedList = leads.map(l => l.id === leadData.id ? { 
        ...l, 
        ...leadData, 
        updated_at: new Date().toISOString() 
      } : l);
    } else {
      const newLead: Lead = {
        ...leadData,
        created_at: new Date().toISOString()
      };
      updatedList = [newLead, ...leads];
    }
    saveOfflineLeads(updatedList);
  };

  const handleDeleteLead = async (id: string) => {
    const client = getSupabaseClient();
    if (isSupabaseLive && client) {
      try {
        const { error } = await client
          .from('crm_leads')
          .delete()
          .eq('id', id);

        if (error) throw error;
        loadLeads();
      } catch (err) {
        console.error("Erro ao deletar no Supabase, executando localmente:", err);
        const filtered = leads.filter(l => l.id !== id);
        saveOfflineLeads(filtered);
      }
    } else {
      const filtered = leads.filter(l => l.id !== id);
      saveOfflineLeads(filtered);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Lead['status']) => {
    // Immediate optimistic local update for extreme smooth drag feel
    setLeads(current => current.map(l => l.id === id ? { ...l, status: newStatus } : l));

    const client = getSupabaseClient();
    if (isSupabaseLive && client) {
      try {
        const { error } = await client
          .from('crm_leads')
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (error) throw error;
      } catch (err) {
        console.error("Erro ao mudar status no Supabase:", err);
        // Persist local storage fallback
        const updated = leads.map(l => l.id === id ? { ...l, status: newStatus } : l);
        saveOfflineLeads(updated);
      }
    } else {
      const updated = leads.map(l => l.id === id ? { ...l, status: newStatus } : l);
      saveOfflineLeads(updated);
    }
  };

  // Drag and Drop implementation
  const handleDragOver = (e: React.DragEvent, colStatus: string) => {
    e.preventDefault();
    setDragOverCol(colStatus);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Lead['status']) => {
    e.preventDefault();
    setDragOverCol(null);
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      handleStatusChange(id, targetStatus);
    }
  };

  // Filter & Search & Sort operations
  const filteredAndSortedLeads = useMemo(() => {
    let result = [...leads];

    // 1. Text Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        l => l.title.toLowerCase().includes(query) || 
             l.client_name.toLowerCase().includes(query) ||
             (l.notes && l.notes.toLowerCase().includes(query))
      );
    }

    // 2. Priority Filter
    if (priorityFilter !== 'Todos') {
      result = result.filter(l => l.priority === priorityFilter);
    }

    // 3. Sorting
    result.sort((a, b) => {
      if (sortBy === 'valor-maior') return (b.val || 0) - (a.val || 0);
      if (sortBy === 'valor-menor') return (a.val || 0) - (b.val || 0);
      if (sortBy === 'nome-cliente') return a.client_name.localeCompare(b.client_name);
      if (sortBy === 'antigos') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      
      // Default: 'recentes' (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    return result;
  }, [leads, searchQuery, priorityFilter, sortBy]);

  // Group columns
  const todoLeads = filteredAndSortedLeads.filter(l => l.status === 'Não iniciado');
  const doingLeads = filteredAndSortedLeads.filter(l => l.status === 'Em Andamento');
  const doneLeads = filteredAndSortedLeads.filter(l => l.status === 'Finalizado');

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  const openNewLeadInStatus = (status: Lead['status']) => {
    setSelectedLead(null);
    setDefaultStatus(status);
    setIsLeadModalOpen(true);
  };

  const totalValueCol = (leadsCol: Lead[]) => {
    const sum = leadsCol.reduce((acc, lead) => acc + (lead.val || 0), 0);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(sum);
  };

  return (
    <div id="crm-app-root" className="min-h-screen bg-slate-50/70 text-slate-800 antialiased font-sans flex flex-col">
      
      {/* Visual Workspace Banner Container */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/10">
              <FolderKanban className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">CRM Kanban</h1>
                <span className="inline-flex items-center bg-slate-100 text-slate-800 text-[10px] font-bold px-1.5 py-0.5 rounded">V1.2</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-medium hidden sm:block">Gerencie funil de vendas e tarefas em tempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status bar */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
              isSupabaseLive 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {isSupabaseLive ? 'Sincronizado via Supabase' : 'Modo Offline (Local)'}
            </div>

            <button
              onClick={() => setIsConfigModalOpen(true)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-1.5 p-1 rounded transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>Conexão</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Warning Panel if User enters Config but Table is missing */}
        {isTableMissing && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm text-amber-900">Epa! A tabela crm_leads não foi encontrada</h4>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed max-w-2xl">
                  Suas configurações do Supabase estão salvas, porém a tabela <strong>crm_leads</strong> não foi instalada no seu banco de dados ou as políticas RLS estão pendentes. O CRM está utilizando o modo local seguro até que a estrutura seja criada.
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 shrink-0 w-full md:w-auto">
              <button
                onClick={handleCopySQL}
                className="flex-1 md:flex-none justify-center inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
              >
                {sqlCopied ? <Check className="w-4 h-4 text-emerald-200" /> : <Copy className="w-4 h-4" />}
                {sqlCopied ? 'SQL Copiado!' : 'Copiar Script SQL'}
              </button>
              <button
                onClick={() => setIsConfigModalOpen(true)}
                className="flex-1 md:flex-none justify-center inline-flex items-center gap-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 rounded-lg px-4 py-2 text-xs font-semibold transition-colors"
              >
                Instruções de Instalação
              </button>
            </div>
          </div>
        )}

        {/* Analytics KPIs Section */}
        <DashboardStats leads={leads} />

        {/* Filters, Database indicators and CTAs */}
        <FilterBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onNewLead={() => {
            setSelectedLead(null);
            setDefaultStatus('Não iniciado');
            setIsLeadModalOpen(true);
          }}
          onOpenConfig={() => setIsConfigModalOpen(true)}
          isSupabaseConnected={isSupabaseLive}
          onForceReload={loadLeads}
          isLoading={isLoading}
        />

        {/* Loading Overlay State */}
        {isLoading && leads.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium">Carregando dados das oportunidades...</p>
          </div>
        ) : (
          /* Kanban Board Columns Grid */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* COLUMN: Não iniciado */}
            <div 
              onDragOver={(e) => handleDragOver(e, 'Não iniciado')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'Não iniciado')}
              className={`rounded-2xl transition-all duration-200 flex flex-col bg-slate-100/60 border ${
                dragOverCol === 'Não iniciado' 
                  ? 'border-blue-400 bg-blue-50/25 ring-4 ring-blue-500/10' 
                  : 'border-slate-200/60'
              }`}
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight uppercase">Não Iniciado</h3>
                  <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                    {todoLeads.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    {totalValueCol(todoLeads)}
                  </span>
                  <button
                    onClick={() => openNewLeadInStatus('Não iniciado')}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-200 rounded transition-colors"
                    title="Adicionar nesta coluna"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cards block */}
              <div className="p-3 space-y-3 min-h-[500px] max-h-[70vh] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {todoLeads.length === 0 ? (
                    <div className="py-12 px-4 border-2 border-dashed border-slate-300/40 rounded-xl flex flex-col items-center justify-center text-center text-slate-400">
                      <p className="text-xs font-medium">Sem oportunidades</p>
                      <button 
                        onClick={() => openNewLeadInStatus('Não iniciado')}
                        className="text-[11px] text-blue-600 font-semibold mt-1.5 hover:underline"
                      >
                        Criar manual
                      </button>
                    </div>
                  ) : (
                    todoLeads.map(lead => (
                      <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        onEdit={(l) => { setSelectedLead(l); setIsLeadModalOpen(true); }}
                        onDelete={handleDeleteLead}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* COLUMN: Em Andamento */}
            <div 
              onDragOver={(e) => handleDragOver(e, 'Em Andamento')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'Em Andamento')}
              className={`rounded-2xl transition-all duration-200 flex flex-col bg-slate-100/60 border ${
                dragOverCol === 'Em Andamento' 
                  ? 'border-amber-400 bg-amber-50/25 ring-4 ring-amber-500/10' 
                  : 'border-slate-200/60'
              }`}
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight uppercase">Em Andamento</h3>
                  <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                    {doingLeads.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    {totalValueCol(doingLeads)}
                  </span>
                  <button
                    onClick={() => openNewLeadInStatus('Em Andamento')}
                    className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-200 rounded transition-colors"
                    title="Adicionar nesta coluna"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cards block */}
              <div className="p-3 space-y-3 min-h-[500px] max-h-[70vh] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {doingLeads.length === 0 ? (
                    <div className="py-12 px-4 border-2 border-dashed border-slate-300/40 rounded-xl flex flex-col items-center justify-center text-center text-slate-400">
                      <p className="text-xs font-medium">Sem oportunidades em progresso</p>
                      <button 
                        onClick={() => openNewLeadInStatus('Em Andamento')}
                        className="text-[11px] text-amber-600 font-semibold mt-1.5 hover:underline"
                      >
                        Mover ou criar nova
                      </button>
                    </div>
                  ) : (
                    doingLeads.map(lead => (
                      <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        onEdit={(l) => { setSelectedLead(l); setIsLeadModalOpen(true); }}
                        onDelete={handleDeleteLead}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* COLUMN: Finalizado */}
            <div 
              onDragOver={(e) => handleDragOver(e, 'Finalizado')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'Finalizado')}
              className={`rounded-2xl transition-all duration-200 flex flex-col bg-slate-100/60 border ${
                dragOverCol === 'Finalizado' 
                  ? 'border-emerald-400 bg-emerald-50/25 ring-4 ring-emerald-500/10' 
                  : 'border-slate-200/60'
              }`}
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-200/50">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h3 className="font-bold text-slate-800 text-sm tracking-tight uppercase">Finalizado</h3>
                  <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full font-mono">
                    {doneLeads.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 font-mono">
                    {totalValueCol(doneLeads)}
                  </span>
                  <button
                    onClick={() => openNewLeadInStatus('Finalizado')}
                    className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-slate-200 rounded transition-colors"
                    title="Adicionar nesta coluna"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Cards block */}
              <div className="p-3 space-y-3 min-h-[500px] max-h-[70vh] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                  {doneLeads.length === 0 ? (
                    <div className="py-12 px-4 border-2 border-dashed border-slate-300/40 rounded-xl flex flex-col items-center justify-center text-center text-slate-400">
                      <p className="text-xs font-medium">Nenhum negócio finalizado ainda</p>
                      <button 
                        onClick={() => openNewLeadInStatus('Finalizado')}
                        className="text-[11px] text-emerald-600 font-semibold mt-1.5 hover:underline"
                      >
                        Arraste cartões aqui para concluir
                      </button>
                    </div>
                  ) : (
                    doneLeads.map(lead => (
                      <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        onEdit={(l) => { setSelectedLead(l); setIsLeadModalOpen(true); }}
                        onDelete={handleDeleteLead}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Modern UI Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 CRM Kanban - Sincronização em Tempo Real Supabase</p>
          <div className="flex gap-4">
            <a href="#" onClick={(e) => { e.preventDefault(); setIsConfigModalOpen(true); }} className="hover:text-blue-600 underline">Configurações de Banco de Dados</a>
            <span className="text-slate-200">|</span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseLive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              {isSupabaseLive ? 'Online Sync' : 'Local Sandbox Mode'}
            </span>
          </div>
        </div>
      </footer>

      {/* Editor & Creator Modal */}
      <LeadModal 
        isOpen={isLeadModalOpen}
        onClose={() => { setIsLeadModalOpen(false); setSelectedLead(null); }}
        onSave={handleSaveLead}
        lead={selectedLead}
        defaultStatus={defaultStatus}
      />

      {/* Database Connection Config Modal */}
      <SupabaseConfigModal 
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onConfigChanged={loadLeads}
      />
    </div>
  );
}
