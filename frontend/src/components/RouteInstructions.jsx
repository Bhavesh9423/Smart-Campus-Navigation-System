import React from 'react';
import {
  Navigation,
  CornerUpLeft,
  CornerUpRight,
  ArrowUp,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Footprints,
  Compass,
  AlertTriangle
} from 'lucide-react';

export default function RouteInstructions({ route }) {
  if (!route) return null;

  const getStepIcon = (text) => {
    const t = text.toLowerCase();
    if (t.includes('stairs')) return <ArrowUp className="w-4 h-4 text-amber-400 rotate-45" />;
    if (t.includes('ramp')) return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    if (t.includes('left')) return <CornerUpLeft className="w-4 h-4 text-cyan-400" />;
    if (t.includes('right')) return <CornerUpRight className="w-4 h-4 text-cyan-400" />;
    if (t.includes('arrived') || t.includes('destination')) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    return <ArrowUp className="w-4 h-4 text-teal-400" />;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Route Header Metrics */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Route Summary</span>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5 text-teal-400 font-bold text-lg font-['Outfit']">
              <Footprints className="w-5 h-5 text-teal-400" />
              <span>{route.distance} m</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-lg font-['Outfit']">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>~{route.estimated_time} min</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          {route.accessible_route ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              ♿ Accessible Route
            </span>
          ) : (
            <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              Standard Route
            </span>
          )}
          <span className="text-[10px] text-slate-500 font-mono">
            Algorithm: {route.algorithm || 'A*'}
          </span>
        </div>
      </div>

      {/* Origin -> Destination Preview */}
      <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2">
        <div className="flex items-start gap-2.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">From</span>
            <p className="text-slate-200 font-medium">{route.start_name}</p>
          </div>
        </div>
        <div className="ml-1 border-l-2 border-dashed border-slate-700 h-3"></div>
        <div className="flex items-start gap-2.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0"></div>
          <div>
            <span className="text-[10px] text-slate-500 font-semibold uppercase">To</span>
            <p className="text-slate-200 font-medium">{route.destination_name}</p>
          </div>
        </div>
      </div>

      {/* Warnings if any */}
      {route.warnings && route.warnings.length > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-xs text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
          <div>{route.warnings.join(' ')}</div>
        </div>
      )}

      {/* Turn-by-Turn Instruction Steps */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-teal-400" />
          Turn-by-Turn Directions ({route.instructions.length} steps)
        </h4>

        <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
          {route.instructions.map((stepText, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700">
                {getStepIcon(stepText)}
              </div>
              <div className="flex-1 text-xs">
                <span className="text-[10px] text-slate-500 font-mono font-bold block mb-0.5">
                  STEP {idx + 1}
                </span>
                <p className="text-slate-200 leading-relaxed">{stepText}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
