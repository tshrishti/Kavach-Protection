import { useState, useEffect } from 'react'
import { Shield, Users, Clock, Server, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { getStats } from '../api/kavachApi'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = async () => {
    try {
      const response = await getStats()
      setStats(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch gateway stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader title="Dashboard" description="PQC Gateway Overview" icon={Shield} />
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader title="Dashboard" description="PQC Gateway Overview" icon={Shield} />
        <div className="card bg-red-900/20 border-red-700">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchStats} className="btn-primary mt-4">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <PageHeader title="Dashboard" description="PQC Gateway Overview" icon={Shield} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Gateway Mode" value={stats?.mode?.toUpperCase() || 'HYBRID-PQC'} icon={Shield} />
        <StatCard title="Active Users" value={stats?.active_users || 0} icon={Users} />
        <StatCard title="Avg Latency" value={stats?.latency || 0} unit="ms" icon={Clock} />
        <StatCard title="RPS" value={stats?.rps || 0} icon={Server} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="text-slate-300 font-mono mb-3">Gateway Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span className="text-emerald-500 font-mono">● {stats?.gateway_status || 'healthy'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Artifact Pool</span>
              <span className="text-slate-200 font-mono">{stats?.pool_size || 0} / 50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cache Size</span>
              <span className="text-slate-200 font-mono">{stats?.cache_size || 0} entries</span>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-slate-300 font-mono mb-3">PQC Information</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">KEM</span>
              <span className="text-emerald-500 font-mono">ML-KEM-768</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Signature</span>
              <span className="text-emerald-500 font-mono">ML-DSA-65</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">NIST Level</span>
              <span className="text-slate-200 font-mono">Level 3 / 5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}