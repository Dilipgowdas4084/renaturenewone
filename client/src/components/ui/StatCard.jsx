// Icon can be a component (lucide icons are forwardRef objects, not plain functions) or a rendered element.
import { isValidElement } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'emerald' }) {
  const colorMap = {
    emerald: {
      icon: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      accent: 'from-emerald-500/10 to-transparent'
    },
    amber: {
      icon: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      accent: 'from-amber-500/10 to-transparent'
    },
    red: {
      icon: 'text-red-400 bg-red-500/10 border-red-500/20',
      accent: 'from-red-500/10 to-transparent'
    },
    blue: {
      icon: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      accent: 'from-blue-500/10 to-transparent'
    }
  };

  const selectedColor = colorMap[color] || colorMap.emerald;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#091813]/80 border border-white/[0.08] p-6 backdrop-blur-xl hover:border-emerald-500/30 transition-all duration-300 group shadow-lg shadow-black/20">
      {/* Top ambient highlight */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${selectedColor.accent} blur-2xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity`} />

      <div className="relative flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">{title}</p>
          <h3 className="text-3xl font-extrabold tracking-tight text-white mt-1.5">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${selectedColor.icon} transition-transform duration-300 group-hover:scale-105 shadow-sm`}>
            {isValidElement(Icon) ? Icon : <Icon className="w-5 h-5" />}
          </div>
        )}
      </div>
      
      <div className="relative flex items-center justify-between pt-1 border-t border-white/[0.04]">
        {subtitle && <p className="text-xs text-stone-400">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.positive ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'
          }`}>
            {trend.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
