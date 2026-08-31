import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'emerald' }) {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-950/30 border-emerald-900/30',
    amber: 'text-amber-400 bg-amber-950/30 border-amber-900/30',
    red: 'text-red-400 bg-red-950/30 border-red-900/30',
    blue: 'text-blue-400 bg-blue-950/30 border-blue-900/30'
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6 backdrop-blur-xl hover:bg-white/[0.04] transition-colors duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-stone-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-stone-100 mt-1">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trend.positive ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}
