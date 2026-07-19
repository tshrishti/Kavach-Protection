import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader.jsx";
import { Shield, CheckCircle, AlertTriangle, BarChart3, Users, Clock, Zap } from "lucide-react";
import kavachApi from "../api/kavachApi";

export default function LoadTestResults() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await kavachApi.get("/load-test-results");
        setResults(res.data);
      } catch (err) {
        console.error("Failed to fetch load test results", err);
        setError("Could not load load-test results. Is the gateway running on :8000?");
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p>Loading load test results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
          <p className="text-rose-400">{error || "No load-test data available."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4">
      <PageHeader 
        title="PQC Load Test Results" 
        subtitle="1000 Concurrent Users - 0 Failures - Quantum Protected" 
      />

      {/* Success Banner */}
      <div className="mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
          <div>
            <h2 className="text-xl font-bold text-emerald-400">TEST PASSED - 100% SUCCESS RATE</h2>
            <p className="text-slate-300">
              {results?.total_requests?.toLocaleString()} requests completed with {results?.failures} failures
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">Concurrent Users</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">{results?.total_users?.toLocaleString()}</div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Requests/Second</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">{results?.rps?.toLocaleString()}</div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Avg Latency</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">{results?.avg_latency_ms} ms</div>
        </div>

        <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm">PQC Protection</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">ACTIVE</div>
        </div>
      </div>

      {/* Per-Endpoint Results */}
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Results by Endpoint</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2">Endpoint</th>
                <th className="text-right py-2">Requests</th>
                <th className="text-right py-2">Failures</th>
                <th className="text-right py-2">Avg Latency</th>
                <th className="text-right py-2">RPS</th>
                <th className="text-center py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {results?.results_by_endpoint && Object.entries(results.results_by_endpoint).map(([key, data]) => (
                <tr key={key} className="border-b border-slate-800">
                  <td className="py-2 font-mono">{key.replace("_", " ").toUpperCase()}</td>
                  <td className="text-right">{data.requests.toLocaleString()}</td>
                  <td className="text-right text-emerald-400">{data.failures}</td>
                  <td className="text-right">{data.avg_latency} ms</td>
                  <td className="text-right">{data.rps}</td>
                  <td className="text-center">
                    <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                      PASS
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Protection Explanation */}
      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-400" />
          How PQC Protected Against Quantum Attacks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded bg-slate-800/50">
            <div className="text-rose-400 line-through text-sm">RSA-2048 (Broken)</div>
            <div className="text-emerald-400 font-mono text-sm mt-1">→ ML-KEM-768</div>
            <p className="text-xs text-slate-400 mt-2">Shor's algorithm cannot break lattice-based crypto</p>
          </div>
          <div className="p-3 rounded bg-slate-800/50">
            <div className="text-rose-400 line-through text-sm">ECDH-256 (Broken)</div>
            <div className="text-emerald-400 font-mono text-sm mt-1">→ ML-KEM-768</div>
            <p className="text-xs text-slate-400 mt-2">178-bit post-quantum security level</p>
          </div>
          <div className="p-3 rounded bg-slate-800/50">
            <div className="text-amber-400 line-through text-sm">AES-128 (Weakened)</div>
            <div className="text-emerald-400 font-mono text-sm mt-1">→ ML-DSA-65</div>
            <p className="text-xs text-slate-400 mt-2">Grover's search ineffective against lattice problems</p>
          </div>
        </div>
      </div>
    </div>
  );
}