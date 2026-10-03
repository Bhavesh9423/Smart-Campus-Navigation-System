import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export default function Toast() {
  const { toast, showToast } = useNavigation();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-cyan-400 shrink-0" />
  };

  const borderColors = {
    success: 'border-emerald-500/40 bg-slate-900/95 text-emerald-200 shadow-emerald-950/50',
    error: 'border-rose-500/40 bg-slate-900/95 text-rose-200 shadow-rose-950/50',
    warning: 'border-amber-500/40 bg-slate-900/95 text-amber-200 shadow-amber-950/50',
    info: 'border-cyan-500/40 bg-slate-900/95 text-cyan-200 shadow-cyan-950/50'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in-up">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all ${borderColors[toast.type] || borderColors.info}`}>
        {icons[toast.type] || icons.info}
        <div className="text-sm font-medium flex-1 pr-2">
          {toast.message}
        </div>
        <button
          onClick={() => showToast(null)}
          className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
