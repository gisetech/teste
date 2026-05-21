import { Search, Filter, ArrowUpDown, Plus, Database, RefreshCw, AlertCircle } from 'lucide-react';
import { Lead } from '../types';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  priorityFilter: string;
  setPriorityFilter: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  onNewLead: () => void;
  onOpenConfig: () => void;
  isSupabaseConnected: boolean;
  onForceReload?: () => void;
  isLoading: boolean;
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  onNewLead,
  onOpenConfig,
  isSupabaseConnected,
  onForceReload,
  isLoading
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-4 mb-6 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 max-w-3xl">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            placeholder="Pesquisar por negócio ou cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-hidden focus:border-blue-500 hover:border-slate-300 transition-all"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="Todos">Todas as Prioridades</option>
            <option value="Alta">Alta prioridade</option>
            <option value="Média">Média prioridade</option>
            <option value="Baixa">Baixa prioridade</option>
          </select>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 bg-white focus:outline-hidden focus:border-blue-500 hover:border-slate-300 transition-all"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="recentes">Mais recentes</option>
            <option value="antigos">Mais antigos</option>
            <option value="valor-maior">Maior valor</option>
            <option value="valor-menor">Menor valor</option>
            <option value="nome-cliente">Nome do Cliente (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Connection state & CTA Buttons */}
      <div className="flex items-center justify-end gap-2.5">
        
        {/* Supabase Status Indicator */}
        <button
          onClick={onOpenConfig}
          className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs transition-all ${
            isSupabaseConnected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100/70'
              : 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100/70'
          }`}
          title={isSupabaseConnected ? 'Conectado ao Supabase em tempo real! Clique para ver configurações' : 'Utilizando modo Offline Local. Clique para conectar ao Supabase'}
        >
          <Database className={`w-3.5 h-3.5 ${isSupabaseConnected ? 'animate-pulse text-emerald-600' : 'text-rose-500'}`} />
          <span className="hidden leading-none lg:inline">
            {isSupabaseConnected ? 'Supabase Conectado' : 'Modo Offline (Configurar)'}
          </span>
          <span className="lg:hidden leading-none">
            {isSupabaseConnected ? 'Supabase' : 'Offline'}
          </span>
        </button>

        {/* Refresh button if connected */}
        {isSupabaseConnected && onForceReload && (
          <button
            onClick={onForceReload}
            disabled={isLoading}
            className="p-2 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-600 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            title="Recarregar dados do Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}

        {/* Create Lead Button */}
        <button
          onClick={onNewLead}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Oportunidade</span>
        </button>
      </div>
    </div>
  );
}
