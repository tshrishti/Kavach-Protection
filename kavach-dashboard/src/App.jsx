import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import LiveTraffic from './pages/LiveTraffic'
import LogsViewer from './pages/LogsViewer'
import Settings from './pages/Settings'
import AttackSimulation from './pages/AttackSimulation'
import Benchmarks from './pages/Benchmarks'
import LoadTestResults from './pages/LoadTestResults'

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-slate-900">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/traffic" element={<LiveTraffic />} />
            <Route path="/logs" element={<LogsViewer />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/attack" element={<AttackSimulation />} />
            <Route path="/benchmarks" element={<Benchmarks />} />
            <Route path="/load-test" element={<LoadTestResults />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App