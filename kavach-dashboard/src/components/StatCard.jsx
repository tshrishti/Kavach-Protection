import { TrendingUp, TrendingDown } from 'lucide-react'

export default function StatCard({ title, value, unit, change, icon: Icon }) {
  const isPositive = change && change > 0
  
  return (
    <div className="card hover:border-emerald-500/50 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-slate-700 rounded-lg">
          <Icon className="w-5 h-5 text-emerald-500" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-slate-400 text-sm font-mono mb-1">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold font-mono text-slate-100">{value}</span>
        {unit && <span className="text-slate-500 text-sm">{unit}</span>}
      </div>
    </div>
  )
}