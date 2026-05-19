import { useState, useEffect } from 'react'
import { Skull, Shield, Lock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { getAttackStatus } from '../api/kavachApi'

export default function AttackSimulation() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStatus = async () => {
    try {
      const response = await getAttackStatus()
      setStatus(response.data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch attack status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="p-6">
        <PageHeader title="Attack Simulation" description="Quantum Threat Assessment" icon={Skull} />
        <div className="flex justify-center items-center h-96">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <PageHeader title="Attack Simulation" description="Quantum Threat Assessment" icon={Skull} />
        <div className="card bg-red-900/20 border-red-700">
          <p className="text-red-400">{error}</p>
          <button onClick={fetchStatus} className="btn-primary mt-4">Retry</button>
        </div>
      </div>
    )
  }

  const algorithms = [
    { name: 'RSA-2048', key: 'rsa', description: 'Classical public-key cryptography', threat: 'Broken by Shor\'s algorithm' },
    { name: 'ECDH-256', key: 'ecdh', description: 'Elliptic Curve Diffie-Hellman', threat: 'Broken by Shor\'s algorithm' },
    { name: 'AES-256', key: 'aes', description: 'Symmetric encryption', threat: 'Weakened by Grover\'s algorithm' },
    { name: 'Kavach (ML-KEM)', key: 'ml_kem', description: 'Post-Quantum KEM', threat: 'Quantum resistant' },
    { name: 'Kavach (ML-DSA)', key: 'ml_dsa', description: 'Post-Quantum Signature', threat: 'Quantum resistant' },
  ]

  return (
    <div className="p-6">
      <PageHeader title="Attack Simulation" description="Quantum Threat Assessment" icon={Skull} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-slate-300 font-mono mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Algorithm Security Status
          </h3>
          <div className="space-y-3">
            {algorithms.map((algo) => (
              <div key={algo.key} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    {status?.[algo.key] === 'secure' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    {status?.[algo.key] === 'broken' && <Skull className="w-5 h-5 text-red-500" />}
                    {status?.[algo.key] === 'weakened' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                    <span className="text-slate-200 font-mono">{algo.name}</span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1">{algo.description}</p>
                  <p className="text-slate-600 text-xs mt-1">{algo.threat}</p>
                </div>
                <span className={`font-mono text-sm ${
                  status?.[algo.key] === 'secure' ? 'text-emerald-500' :
                  status?.[algo.key] === 'broken' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  {status?.[algo.key]?.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-slate-300 font-mono mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            Quantum Threat Analysis
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <h4 className="text-red-400 font-mono mb-2">Shor's Algorithm Impact</h4>
              <p className="text-slate-300 text-sm">
                RSA and ECC are vulnerable to quantum attacks using Shor's algorithm. 
                With sufficient qubits (≈4099 for 2048-bit RSA), keys can be factored 
                in polynomial time, completely breaking classical PKI.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <h4 className="text-yellow-400 font-mono mb-2">Grover's Algorithm Impact</h4>
              <p className="text-slate-300 text-sm">
                AES-256's effective key strength reduces from 256 to 128 bits against
                Grover's algorithm. While 128 bits remains secure for now, doubling
                key size is recommended for long-term quantum resistance.
              </p>
            </div>
            
            <div className="p-4 bg-emerald-900/20 border border-emerald-700 rounded-lg">
              <h4 className="text-emerald-400 font-mono mb-2">Kavach Protection</h4>
              <p className="text-slate-300 text-sm">
                ML-KEM-768 (Kyber) and ML-DSA-65 (Dilithium) are NIST-approved 
                post-quantum algorithms resistant to both Shor's and Grover's 
                algorithms. They provide quantum-safe security for your APIs with 
                acceptable performance trade-offs.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card mt-6">
        <h3 className="text-slate-300 font-mono mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          Simulation Results
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-800 rounded-lg">
            <p className="text-slate-500 text-sm">RSA-2048 Breaking Time</p>
            <p className="text-2xl font-bold text-red-500 mt-1">~8 hours</p>
            <p className="text-slate-500 text-xs mt-1">with 4099 logical qubits</p>
          </div>
          <div className="text-center p-4 bg-slate-800 rounded-lg">
            <p className="text-slate-500 text-sm">ML-KEM-768 Breaking Time</p>
            <p className="text-2xl font-bold text-emerald-500 mt-1">&gt; 10³⁰ years</p>
            <p className="text-slate-500 text-xs mt-1">quantum resistant</p>
          </div>
          <div className="text-center p-4 bg-slate-800 rounded-lg">
            <p className="text-slate-500 text-sm">AES-256 Effective Strength</p>
            <p className="text-2xl font-bold text-yellow-500 mt-1">128 bits</p>
            <p className="text-slate-500 text-xs mt-1">after Grover's algorithm</p>
          </div>
        </div>
      </div>
    </div>
  )
}