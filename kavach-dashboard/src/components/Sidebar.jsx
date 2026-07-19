import { NavLink } from 'react-router-dom'
import { Shield, Activity, BarChart3, FileText, Settings, Skull, Zap, Gauge } from 'lucide-react'

const navItems = [
  { path: '/', icon: Shield, label: 'Dashboard' },
  { path: '/traffic', icon: Activity, label: 'Live Traffic' },
  { path: '/benchmarks', icon: BarChart3, label: 'Benchmarks' },
  { path: '/load-test', icon: Gauge, label: 'Load Test' },
  { path: '/attack', icon: Skull, label: 'Attack Status' },
  { path: '/logs', icon: FileText, label: 'Logs' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-emerald-500" />
          <h1 className="text-lg font-bold font-mono">
            <span className="text-emerald-500">Kavach</span>
            <span className="text-slate-400">PQC</span>
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">Quantum-Secure Gateway</p>
      </div>
      
      <nav className="flex-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors ${
                isActive 
                  ? 'bg-emerald-600/20 text-emerald-400 border-l-2 border-emerald-500' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span className="text-sm font-mono">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-500">
          <p>ML-KEM-768</p>
          <p>ML-DSA-65</p>
          <p className="text-emerald-500 mt-1">● POST-QUANTUM</p>
        </div>
      </div>
    </aside>
  )
}