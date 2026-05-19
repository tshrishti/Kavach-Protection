import { useState, useEffect } from 'react'
import { FileText, Search, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getLogs } from '../api/kavachApi'

export default function LogsViewer() {
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState(null)

  const fetchLogs = async () => {
    try {
      const response = await getLogs()
      setLogs(response.data || [])
      setFilteredLogs(response.data || [])
      setError(null)
    } catch (err) {
      setError('Failed to fetch logs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (searchTerm) {
      setFilteredLogs(logs.filter(log => 
        log.endpoint?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.client_ip?.includes(searchTerm)
      ))
    } else {
      setFilteredLogs(logs)
    }
  }, [searchTerm, logs])

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader title="Request Logs" description="Gateway Request History" icon={FileText} />
        <div className="flex justify-center items-center h-96">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader title="Request Logs" description="Gateway Request History" icon={FileText} />
        <div className="card bg-red-900/20 border-red-700">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchLogs} className="btn-primary mt-4">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <PageHeader title="Request Logs" description="Gateway Request History" icon={FileText} />
      
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search logs by endpoint, method, or IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>
      
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 font-mono text-xs">Timestamp</th>
              <th className="text-left py-3 px-4 text-slate-400 font-mono text-xs">Method</th>
              <th className="text-left py-3 px-4 text-slate-400 font-mono text-xs">Endpoint</th>
              <th className="text-left py-3 px-4 text-slate-400 font-mono text-xs">Status</th>
              <th className="text-left py-3 px-4 text-slate-400 font-mono text-xs">Latency</th>
              <th className="text-left py-3 px-4 text-slate-400 font-mono text-xs">Client IP</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.slice().reverse().slice(0, 100).map((log, idx) => (
              <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/50">
                <td className="py-3 px-4 text-slate-300 font-mono text-xs">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    log.method === 'GET' ? 'bg-emerald-600/20 text-emerald-400' : 
                    log.method === 'POST' ? 'bg-blue-600/20 text-blue-400' :
                    'bg-yellow-600/20 text-yellow-400'
                  }`}>
                    {log.method}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-300 font-mono text-xs">{log.endpoint}</td>
                <td className="py-3 px-4">
                  {log.status === 200 ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-300 font-mono text-xs">{log.latency}ms</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-slate-400 font-mono text-xs">{log.client_ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-slate-500">No logs found</div>
        )}
      </div>
    </div>
  )
}