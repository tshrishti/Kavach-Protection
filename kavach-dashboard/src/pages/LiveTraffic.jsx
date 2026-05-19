import { useState, useEffect } from 'react'
import { Activity, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import PageHeader from '../components/PageHeader'
import { getTrafficTimeline } from '../api/kavachApi'

export default function LiveTraffic() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTraffic = async () => {
    try {
      const response = await getTrafficTimeline()
      setData(response.data.timeline || [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch traffic data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTraffic()
    const interval = setInterval(fetchTraffic, 3000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader title="Live Traffic" description="Real-time API Traffic Monitoring" icon={Activity} />
        <div className="flex justify-center items-center h-96">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader title="Live Traffic" description="Real-time API Traffic Monitoring" icon={Activity} />
        <div className="card bg-red-900/20 border-red-700">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchTraffic} className="btn-primary mt-4">Retry</button>
        </div>
      </div>
    )
  }

  const currentRPS = data[data.length - 1] || { aadhaar_rps: 0, digilocker_rps: 0, upi_rps: 0, total_rps: 0 }

  return (
    <div className="p-6">
      <PageHeader title="Live Traffic" description="Real-time API Traffic Monitoring" icon={Activity} />
      
      <div className="card mb-6">
        <h3 className="text-slate-300 font-mono mb-4">Requests Per Second (RPS)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="timestamp" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            <Line type="monotone" dataKey="aadhaar_rps" stroke="#10b981" name="Aadhaar" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="digilocker_rps" stroke="#3b82f6" name="DigiLocker" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="upi_rps" stroke="#f59e0b" name="UPI" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="total_rps" stroke="#ef4444" name="Total" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <h4 className="text-slate-300 font-mono">Aadhaar API</h4>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {currentRPS.aadhaar_rps} <span className="text-sm text-slate-500">RPS</span>
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <h4 className="text-slate-300 font-mono">DigiLocker API</h4>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {currentRPS.digilocker_rps} <span className="text-sm text-slate-500">RPS</span>
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <h4 className="text-slate-300 font-mono">UPI API</h4>
          </div>
          <p className="text-2xl font-bold text-slate-100">
            {currentRPS.upi_rps} <span className="text-sm text-slate-500">RPS</span>
          </p>
        </div>
      </div>
    </div>
  )
}