import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { type = 'success', message } = toast;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm">
      <div className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
        type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
        type === 'warning' ? 'bg-amber-50 text-amber-900 border-amber-200' :
        type === 'error' ? 'bg-red-50 text-red-900 border-red-200' :
        'bg-slate-50 text-slate-900 border-slate-200'
      }`}>
        {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
        {type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />}
        {type === 'error' && <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
        {type === 'info' && <Info className="w-5 h-5 text-slate-600 shrink-0" />}

        <span className="flex-1">{message}</span>

        <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
