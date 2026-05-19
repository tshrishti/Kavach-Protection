# Kavach Dashboard — Setup Guide

## Prerequisites
- Node.js 18+ installed (download from nodejs.org)

## Step 1: Copy these files
Copy the `kavach-dashboard` folder to wherever you want on your computer.

## Step 2: Open terminal in that folder
Right-click the folder → "Open in Terminal" (or cd into it)

## Step 3: Install dependencies
```bash
npm install
```

## Step 4: Start the development server
```bash
npm run dev
```

## Step 5: Open in browser
Visit: http://localhost:3000

---

## Connecting to your real backend

Edit `src/api/kavachApi.js`:
- Change `BASE_URL` from `"https://127.0.0.1:8000"` to your actual backend URL
- The dashboard auto-falls back to mock data if the API is unreachable

## API endpoints the dashboard uses
| Endpoint | Returns |
|----------|---------|
| GET /stats | active_users, latency, mode, rps, gateway_status |
| GET /logs | Array of request log objects |
| GET /benchmark | classical/pqc/hybrid latency data |
| GET /attack-status | Security status per algorithm |
| GET /traffic/timeline | Time-series traffic by endpoint |

## Project structure
```
src/
  App.jsx              — Main layout + routing
  api/
    kavachApi.js       — All API calls (with mock fallback)
  components/
    Sidebar.jsx        — Navigation
    StatCard.jsx       — Metric card
    PageHeader.jsx     — Page title row
  pages/
    Dashboard.jsx      — Main overview
    LiveTraffic.jsx    — Traffic charts
    AttackSimulation.jsx — Quantum attack panel
    Benchmarks.jsx     — Performance comparison
    LogsViewer.jsx     — Request logs table
    Settings.jsx       — Gateway configuration
```