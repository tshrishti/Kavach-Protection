import { useState, useEffect } from 'react'
import { BarChart3, Zap, Clock, Cpu, RefreshCw, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import PageHeader from '../components/PageHeader'
import { getBenchmark } from '../api/kavachApi'

export default function Benchmarks() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBenchmark = async () => {
    try {
      const response = await getBenchmark()
      setData(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch benchmark data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBenchmark()
    const interval = setInterval(fetchBenchmark, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader title="Benchmarks" description="Performance Comparison" icon={BarChart3} />
        <div className="flex justify-center items-center h-96">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader title="Benchmarks" description="Performance Comparison" icon={BarChart3} />
        <div className="card bg-red-900/20 border-red-700">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchBenchmark} className="btn-primary mt-4">Retry</button>
        </div>
      </div>
    )
  }

  const chartData = data ? [
    { name: 'Classical (RSA)', avg: data.classical?.avg || 0, min: data.classical?.min || 0, max: data.classical?.max || 0 },
    { name: 'PQC (ML-KEM)', avg: data.pqc?.avg || 0, min: data.pqc?.min || 0, max: data.pqc?.max || 0 },
    { name: 'Hybrid', avg: data.hybrid?.avg || 0, min: data.hybrid?.min || 0, max: data.hybrid?.max || 0 },
  ] : []

  const throughputData = [
    { name: 'Classical', requests: 238, color: '#3b82f6' },
    { name: 'PQC', requests: 115, color: '#10b981' },
    { name: 'Hybrid', requests: 78, color: '#f59e0b' },
  ]

  return (
    <div className="p-6">
      <PageHeader title="Benchmarks" description="Performance Comparison" icon={BarChart3} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <h3 className="text-slate-300 font-mono">Classical (RSA-2048)</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100">{data?.classical?.avg || 0} <span className="text-sm text-slate-500">ms avg</span></p>
          <p className="text-slate-500 text-sm mt-1">Min: {data?.classical?.min || 0}ms | Max: {data?.classical?.max || 0}ms</p>
          <p className="text-emerald-500 text-xs mt-2">Fastest but quantum-vulnerable</p>
        </div>
        
        <div className="card border-emerald-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-emerald-500" />
            <h3 className="text-slate-300 font-mono">PQC (ML-KEM + ML-DSA)</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100">{data?.pqc?.avg || 0} <span className="text-sm text-slate-500">ms avg</span></p>
          <p className="text-slate-500 text-sm mt-1">Min: {data?.pqc?.min || 0}ms | Max: {data?.pqc?.max || 0}ms</p>
          <p className="text-emerald-500 text-xs mt-2">✓ Quantum resistant</p>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-amber-500" />
            <h3 className="text-slate-300 font-mono">Hybrid (Classical + PQC)</h3>
          </div>
          <p className="text-2xl font-bold text-slate-100">{data?.hybrid?.avg || 0} <span className="text-sm text-slate-500">ms avg</span></p>
          <p className="text-slate-500 text-sm mt-1">Min: {data?.hybrid?.min || 0}ms | Max: {data?.hybrid?.max || 0}ms</p>
          <p className="text-amber-500 text-xs mt-2">Maximum security</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-slate-300 font-mono mb-4">Latency Comparison (ms)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ color: '#e2e8f0' }} />
              <Bar dataKey="avg" fill="#10b981" name="Average Latency (ms)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="min" fill="#3b82f6" name="Minimum Latency (ms)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="max" fill="#ef4444" name="Maximum Latency (ms)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="card">
          <h3 className="text-slate-300 font-mono mb-4">Throughput (requests/second)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={throughputData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="requests" fill="#10b981" name="Requests/sec" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-slate-300 font-mono mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Overhead Analysis
        </h3>
        <div className="p-4 bg-slate-800 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400">PQC Overhead vs Classical</span>
            <span className="text-2xl font-bold text-emerald-500">+{data?.overhead_percent || 0}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3 mb-4">
            <div 
              className="bg-emerald-500 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (data?.overhead_percent || 0) / 3)}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h4 className="text-slate-400 text-sm mb-2">Performance Impact</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Key Generation:</span>
                  <span className="text-emerald-500">+450% slower</span>
                </li>
                <li className="flex justify-between">
                  <span>Encapsulation:</span>
                  <span className="text-emerald-500">+120% slower</span>
                </li>
                <li className="flex justify-between">
                  <span>Signature Size:</span>
                  <span className="text-emerald-500">24x larger</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-400 text-sm mb-2">Recommendation</h4>
              <p className="text-slate-300 text-sm">
                ML-KEM-768 and ML-DSA-65 provide quantum resistance with acceptable 
                performance trade-off. Hybrid mode ensures backward compatibility 
                while maintaining post-quantum security. For high-throughput systems,
                consider hardware acceleration or request batching.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}