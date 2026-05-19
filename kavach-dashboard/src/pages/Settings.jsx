import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getSettings, updateSettings } from '../api/kavachApi'

export default function Settings() {
  const [settings, setSettings] = useState({
    mode: 'hybrid-pqc',
    cache_enabled: true,
    artifact_pool_size: 50
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const fetchSettings = async () => {
    try {
      const response = await getSettings()
      setSettings(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await updateSettings(settings)
      setMessage({ type: 'success', text: 'Settings saved successfully' })
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save settings' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader title="Settings" description="Gateway Configuration" icon={SettingsIcon} />
        <div className="flex justify-center items-center h-96">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader title="Settings" description="Gateway Configuration" icon={SettingsIcon} />
        <div className="card bg-red-900/20 border-red-700">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchSettings} className="btn-primary mt-4">Retry</button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <PageHeader title="Settings" description="Gateway Configuration" icon={SettingsIcon} />
      
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-emerald-600/20 border border-emerald-600 text-emerald-400' : 'bg-red-600/20 border border-red-600 text-red-400'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="max-w-2xl">
        <div className="card mb-6">
          <h3 className="text-slate-300 font-mono mb-4">Security Mode</h3>
          <div className="space-y-3">
            {['classical', 'pqc', 'hybrid-pqc'].map((mode) => (
              <label key={mode} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-700/50 rounded">
                <input
                  type="radio"
                  name="mode"
                  value={mode}
                  checked={settings.mode === mode}
                  onChange={(e) => setSettings({ ...settings, mode: e.target.value })}
                  className="w-4 h-4 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-slate-200 font-mono capitalize">{mode.replace('-', ' ')}</span>
                <span className="text-slate-500 text-sm">
                  {mode === 'classical' && '(RSA-2048 + ECDSA - Faster but quantum-vulnerable)'}
                  {mode === 'pqc' && '(ML-KEM-768 + ML-DSA-65 - Quantum-safe)'}
                  {mode === 'hybrid-pqc' && '(Classical + PQC Combined - Maximum security)'}
                </span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="card mb-6">
          <h3 className="text-slate-300 font-mono mb-4">Performance</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-slate-700/50 rounded">
              <div>
                <span className="text-slate-200 font-mono">Cache Enabled</span>
                <p className="text-slate-500 text-sm">Cache response for repeated requests (improves performance)</p>
              </div>
              <input
                type="checkbox"
                checked={settings.cache_enabled}
                onChange={(e) => setSettings({ ...settings, cache_enabled: e.target.checked })}
                className="w-5 h-5 text-emerald-500 focus:ring-emerald-500 rounded"
              />
            </label>
            
            <div className="p-2">
              <label className="block text-slate-200 font-mono mb-2">Artifact Pool Size</label>
              <input
                type="range"
                min="10"
                max="200"
                step="10"
                value={settings.artifact_pool_size}
                onChange={(e) => setSettings({ ...settings, artifact_pool_size: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-slate-500 text-sm mt-1">
                <span>10 (Lower memory)</span>
                <span>{settings.artifact_pool_size}</span>
                <span>200 (Higher performance)</span>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}