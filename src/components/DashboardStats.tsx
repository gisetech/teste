import { Lead } from '../types';
import { TrendingUp, RefreshCw, Layers, DollarSign, CheckCircle } from 'lucide-react';

interface DashboardStatsProps {
  leads: Lead[];
}

export default function DashboardStats({ leads }: DashboardStatsProps) {
  const totalValue = leads.reduce((acc, lead) => acc + (lead.val || 0), 0);
  const totalCount = leads.length;

  const notStartedCount = leads.filter(l => l.status === 'Não iniciado').length;
  const inProgressCount = leads.filter(l => l.status === 'Em Andamento').length;
  const completedCount = leads.filter(l => l.status === 'Finalizado').length;

  const completedValue = leads
    .filter(l => l.status === 'Finalizado')
    .reduce((acc, l) => acc + (l.val || 0), 0);

  const conversionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // Format monetary value
  const formatValue = (num: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex items-center justify-between transition-all hover:shadow-md">
        <div>
          <p className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">Valor total do Pipeline</p>
          <h3 className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">{formatValue(totalValue)}</h3>
          <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {totalCount} {totalCount === 1 ? 'oportunidade' : 'oportunidades'}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-blue-600">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex items-center justify-between transition-all hover:shadow-md">
        <div>
          <p className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">Taxa de Conversão</p>
          <h3 className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">{conversionRate.toFixed(1)}%</h3>
          <p className="text-xs text-slate-500 mt-1">
            {completedCount} fechados ({formatValue(completedValue)})
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg text-emerald-600">
          <TrendingUp className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex items-center justify-between transition-all hover:shadow-md">
        <div>
          <p className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">Em Andamento</p>
          <h3 className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">{inProgressCount}</h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <RefreshCw className="w-3 h-3 animate-spin duration-3000" />
            Negociações ativas
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg text-amber-600">
          <RefreshCw className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-5 flex items-center justify-between transition-all hover:shadow-md">
        <div>
          <p className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">Não Iniciados</p>
          <h3 className="text-2xl font-semibold text-slate-800 tracking-tight mt-1">{notStartedCount}</h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-slate-400" />
            Aguardando contato
          </p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-indigo-600">
          <CheckCircle className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
