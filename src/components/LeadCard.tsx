import React from 'react';
import { Lead } from '../types';
import { Mail, Phone, Calendar, Edit2, Trash2, ChevronRight, ChevronLeft, User, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface LeadCardProps {
  key?: string;
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void | Promise<void>;
  onStatusChange: (id: string, newStatus: Lead['status']) => void | Promise<void>;
}

export default function LeadCard({ lead, onEdit, onDelete, onStatusChange }: LeadCardProps) {
  
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', lead.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const getPriorityStyle = (priority: Lead['priority']) => {
    switch (priority) {
      case 'Alta':
        return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10';
      case 'Média':
        return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10';
      case 'Baixa':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200 ring-slate-500/10';
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  };

  // Safe date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return '';
    }
  };

  // Accessible quick actions to shift columns without drag and drop (especially for touch screens or mobile)
  const shiftStatus = (direction: 'left' | 'right') => {
    const statuses: Lead['status'][] = ['Não iniciado', 'Em Andamento', 'Finalizado'];
    const currentIndex = statuses.indexOf(lead.status);
    let nextIndex = currentIndex + (direction === 'right' ? 1 : -1);
    if (nextIndex >= 0 && nextIndex < statuses.length) {
      onStatusChange(lead.id, statuses[nextIndex]);
    }
  };

  return (
    <motion.div
      layoutId={lead.id}
      draggable
      onDragStart={handleDragStart}
      className="bg-white border border-slate-100 hover:border-blue-200 p-4 rounded-xl shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all group select-none relative overflow-hidden"
    >
      {/* Priority accent top border line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${
        lead.priority === 'Alta' ? 'bg-rose-500' : lead.priority === 'Média' ? 'bg-amber-500' : 'bg-slate-300'
      }`} />

      {/* Header and Action Buttons */}
      <div className="flex justify-between items-start gap-2 mb-2">
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ring-1 ring-inset ${getPriorityStyle(lead.priority)}`}>
          {lead.priority}
        </span>
        
        {/* Hover Controls */}
        <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(lead)}
            className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-slate-50"
            title="Editar oportunidade"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm('Tem certeza de que deseja excluir este lead?')) {
                onDelete(lead.id);
              }
            }}
            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-50"
            title="Excluir"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Deal Title */}
      <h4 className="font-semibold text-slate-800 text-sm tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
        {lead.title}
      </h4>

      {/* Client Name */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="font-medium text-slate-700 truncate">{lead.client_name || 'Sem nome de cliente'}</span>
      </div>

      {/* Contact Quick Details */}
      <div className="space-y-1.5 mb-4 border-t border-slate-50 pt-3">
        {lead.client_email && (
          <a
            href={`mailto:${lead.client_email}`}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 group/link transition-colors truncate"
            onClick={(e) => e.stopPropagation()}
          >
            <Mail className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-blue-500 shrink-0" />
            <span className="truncate">{lead.client_email}</span>
          </a>
        )}
        
        {lead.client_phone && (
          <a
            href={`tel:${lead.client_phone}`}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-blue-600 group/link transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <Phone className="w-3.5 h-3.5 text-slate-400 group-hover/link:text-blue-500 shrink-0" />
            <span className="font-mono text-xs">{lead.client_phone}</span>
          </a>
        )}
      </div>

      {/* Card Footer: Value, Date, and Column shifting arrows */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-3">
        {/* Deal Value */}
        <div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block h-3">VALOR</span>
          <span className="text-sm font-semibold text-color-slate-800 font-mono">
            {formatCurrency(lead.val)}
          </span>
        </div>

        {/* Date and Mobile Column Shift buttons */}
        <div className="flex items-center gap-1">
          {lead.created_at && (
            <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1 mr-1" title="Criado em">
              <Calendar className="w-3 h-3" />
              {formatDate(lead.created_at)}
            </span>
          )}

          {/* Shift status arrows for quick click actions (especially tablet/mobile or poor drag target resolution) */}
          <div className="flex bg-slate-50 border border-slate-100 rounded-md p-0.5">
            <button
              onClick={(e) => { e.stopPropagation(); shiftStatus('left'); }}
              disabled={lead.status === 'Não iniciado'}
              className="p-1 rounded text-slate-400 hover:bg-white hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Mover para esquerda"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); shiftStatus('right'); }}
              disabled={lead.status === 'Finalizado'}
              className="p-1 rounded text-slate-400 hover:bg-white hover:text-blue-600 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Mover para direita"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Show short snippet of notes if present */}
      {lead.notes && (
        <div className="mt-3 p-1.5 bg-slate-50/50 rounded-lg text-[11px] text-slate-500 italic max-h-12 overflow-hidden text-ellipsis flex gap-1 items-start">
          <MessageSquare className="w-2.5 h-2.5 shrink-0 mt-0.5 text-slate-400" />
          <span className="line-clamp-2 leading-normal">{lead.notes}</span>
        </div>
      )}
    </motion.div>
  );
}
