import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { X, Save, AlertCircle, Sparkles } from 'lucide-react';

interface LeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadData: Omit<Lead, 'created_at' | 'updated_at'>) => void;
  lead?: Lead | null; // If passing lead, we are in Edit mode
  defaultStatus?: Lead['status'];
}

export default function LeadModal({ isOpen, onClose, onSave, lead, defaultStatus }: LeadModalProps) {
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [val, setVal] = useState<string>('0');
  const [status, setStatus] = useState<Lead['status']>('Não iniciado');
  const [priority, setPriority] = useState<Lead['priority']>('Média');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // When modal is loaded or changes
  useEffect(() => {
    if (lead) {
      setTitle(lead.title);
      setClientName(lead.client_name);
      setClientEmail(lead.client_email || '');
      setClientPhone(lead.client_phone || '');
      setVal(String(lead.val || 0));
      setStatus(lead.status);
      setPriority(lead.priority);
      setNotes(lead.notes || '');
    } else {
      setTitle('');
      setClientName('');
      setClientEmail('');
      setClientPhone('');
      setVal('0');
      setStatus(defaultStatus || 'Não iniciado');
      setPriority('Média');
      setNotes('');
    }
    setError('');
  }, [lead, defaultStatus, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('O nome da oportunidade/tarefa é obrigatório.');
      return;
    }
    if (!clientName.trim()) {
      setError('O nome do cliente é obrigatório.');
      return;
    }

    const numericalValue = parseFloat(val) || 0;

    onSave({
      id: lead ? lead.id : crypto.randomUUID(),
      title: title.trim(),
      client_name: clientName.trim(),
      client_email: clientEmail.trim(),
      client_phone: clientPhone.trim(),
      val: numericalValue,
      status,
      priority,
      notes: notes.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-100 flex flex-col my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">
              {lead ? 'Editar Oportunidade' : 'Nova Oportunidade'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body & Form */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 space-y-4">
          
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Nome da Oportunidade / Negócio *
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              placeholder="Ex: Contrato Anual de Licenças"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Group: Client Details */}
          <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Informações de Contato</h4>
            
            {/* Client Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Nome do Cliente / Empresa *
              </label>
              <input
                type="text"
                className="w-full bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                placeholder="Ex: João Silva ou TecnoMax Ltda"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  E-mail do Cliente
                </label>
                <input
                  type="email"
                  className="w-full bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                  placeholder="Ex: joao@email.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  className="w-full bg-white rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
                  placeholder="Ex: (11) 99999-9999"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Value (R$) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Valor do Negócio (BRL R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-sm text-slate-400 font-medium">R$</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="0,00"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Prioridade
              </label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Lead['priority'])}
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Status / Coluna
            </label>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
              value={status}
              onChange={(e) => setStatus(e.target.value as Lead['status'])}
            >
              <option value="Não iniciado">Não iniciado</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
              Observações / Notas do Negócio
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
              rows={3}
              placeholder="Adicione detalhes de reuniões, propostas, próximos passos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-500 rounded-lg text-sm font-medium transition-colors hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              {lead ? 'Atualizar' : 'Salvar Oportunidade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
