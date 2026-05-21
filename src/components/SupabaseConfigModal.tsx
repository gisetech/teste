import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Database, HelpCircle, HardDrive, ShieldCheck, Zap } from 'lucide-react';
import { getStoredSupabaseConfig, saveStoredSupabaseConfig, clearStoredSupabaseConfig, SUPABASE_SQL_SETUP } from '../supabaseService';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export default function SupabaseConfigModal({ isOpen, onClose, onConfigChanged }: SupabaseConfigModalProps) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    const config = getStoredSupabaseConfig();
    setUrl(config.url);
    setAnonKey(config.anonKey);
    setIsEnabled(config.isEnabled);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && anonKey.trim()) {
      saveStoredSupabaseConfig(url.trim(), anonKey.trim(), isEnabled);
    } else {
      clearStoredSupabaseConfig();
    }
    setSavedStatus(true);
    onConfigChanged();
    setTimeout(() => {
      setSavedStatus(false);
      onClose();
    }, 1200);
  };

  const handleClear = () => {
    clearStoredSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setIsEnabled(false);
    onConfigChanged();
    setSavedStatus(true);
    setTimeout(() => {
      setSavedStatus(false);
      onClose();
    }, 1000);
  };

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SETUP);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col my-8 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">Conectando o Supabase</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <HardDrive className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-xs text-blue-900 uppercase tracking-wide">Persistência Offline (Padrão)</h4>
                <p className="text-xs text-blue-700/80 mt-1">
                  Seu CRM funciona imediatamente sem configurar nada! Os dados são guardados de forma segura localmente no seu navegador (`localStorage`).
                </p>
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex gap-3">
              <Zap className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-xs text-emerald-900 uppercase tracking-wide">Sincronização Supabase (Tempo Real)</h4>
                <p className="text-xs text-emerald-700/80 mt-1">
                  Ao configurar o Supabase, as atualizações do Kanban de leads e contatos serão refletidas em múltiplos navegadores e dispositivos em tempo real.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-4 h-4 text-slate-500" />
              Credenciais do Projeto Supabase
            </h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  URL do Projeto Supabase (API URL)
                </label>
                <input
                  type="url"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
                  placeholder="https://suas-letras-aleatorias.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Chave Pública Anon (Anon Public API Key)
                </label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all font-mono"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="enable_supabase_toggle"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-100 h-4 w-4"
              />
              <label htmlFor="enable_supabase_toggle" className="text-xs font-medium text-slate-700 select-none">
                Ativar sincronização com Supabase (pode desmarcar para suspender e usar offline)
              </label>
            </div>

            {/* Step-by-Step Setup SQL Instructions */}
            <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 text-slate-400 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Configurando o Banco de Dados (SQL do Supabase)
                </div>
                <button
                  type="button"
                  onClick={handleCopySQL}
                  className="inline-flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded-md px-2.5 py-1 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar SQL Setup'}
                </button>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-400">
                Abra o seu <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-emerald-400 underline hover:text-emerald-300">Painel do Supabase</a>, selecione o seu projeto, vá na aba <strong>SQL Editor</strong>, crie um novo script, cole o SQL abaixo e clique em <strong>Run</strong>:
              </p>

              <pre className="text-[10px] bg-slate-950 p-3 rounded-lg font-mono text-slate-300 overflow-x-auto max-h-40 border border-slate-900">
                {SUPABASE_SQL_SETUP}
              </pre>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-rose-600 border border-rose-100 hover:bg-rose-50 rounded-lg text-sm font-medium transition-colors"
              >
                Limpar Credenciais / Desconectar
              </button>

              <div className="flex-1"></div>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 hover:border-slate-300 text-slate-500 rounded-lg text-sm font-medium transition-colors hover:bg-slate-50"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={savedStatus}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm transition-colors disabled:bg-emerald-800"
              >
                {savedStatus ? (
                  <>
                    <Check className="w-4 h-4" />
                    Salvo com sucesso!
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Conectar e Salvar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
