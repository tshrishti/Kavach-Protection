# mock_backend.py - Complete Working Version

import asyncio
import random
import time
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from collections import deque
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Track active users
active_sessions = {}
request_history = deque(maxlen=100)

@app.get("/aadhaar/verify/{uid}")
async def aadhaar_verify(uid: str):
    session_id = f"user_{uid}_{int(time.time())}"
    active_sessions[session_id] = time.time()
    
    await asyncio.sleep(0.01)
    
    # Clean old sessions (older than 5 seconds)
    current_time = time.time()
    expired = [sid for sid, ts in active_sessions.items() if current_time - ts > 5]
    for sid in expired:
        del active_sessions[sid]
    
    result = {
        "status": "verified",
        "uid": uid,
        "name": f"Citizen-{uid[-4:]}",
        "active_users": len(active_sessions),
        "timestamp": time.time()
    }
    
    # Record request
    request_history.append({
        "time": time.time(),
        "endpoint": f"/aadhaar/verify/{uid}",
        "status": 200
    })
    
    return result

@app.get("/digilocker/fetch/{uid}")
async def digilocker_fetch(uid: str):
    session_id = f"digilocker_{uid}_{int(time.time())}"
    active_sessions[session_id] = time.time()
    
    await asyncio.sleep(0.01)
    
    current_time = time.time()
    expired = [sid for sid, ts in active_sessions.items() if current_time - ts > 5]
    for sid in expired:
        del active_sessions[sid]
    
    return {
        "status": "ok",
        "uid": uid,
        "active_users": len(active_sessions),
        "documents": ["PAN", "DL", "VoterID"],
        "timestamp": time.time()
    }

@app.post("/upi/payment")
async def upi_payment(body: dict = None):
    session_id = f"upi_{int(time.time())}"
    active_sessions[session_id] = time.time()
    
    await asyncio.sleep(0.01)
    
    current_time = time.time()
    expired = [sid for sid, ts in active_sessions.items() if current_time - ts > 5]
    for sid in expired:
        del active_sessions[sid]
    
    body = body or {}
    return {
        "status": "success",
        "txn_id": f"TXN{random.randint(1000000, 9999999)}",
        "amount": body.get("amount", 100),
        "active_users": len(active_sessions),
        "timestamp": time.time()
    }

@app.get("/health")
async def health():
    return {"status": "ok", "backend": "mock-gov-api"}

@app.get("/stats")
async def get_stats():
    """Real-time statistics for dashboard"""
    # Calculate RPS from last 60 seconds
    now = time.time()
    recent_requests = [r for r in request_history if now - r["time"] < 60]
    rps = len(recent_requests) / 60
    
    return {
        "active_users": len(active_sessions),
        "latency": round(random.uniform(45, 95), 2),
        "mode": "Hybrid (PQC + Classical)",
        "rps": round(rps, 1),
        "gateway_status": "ACTIVE",
        "pool_size": 50,
        "cache_size": len(request_history),
        "total_requests": len(request_history),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/attack-status")
async def get_attack_status():
    return {
        "rsa": "broken",
        "ecdh": "broken",
        "aes": "weakened",
        "ml_kem": "secure",
        "ml_dsa": "secure"
    }

@app.get("/benchmark")
async def get_benchmark():
    return {
        "classical": {"avg": 3.84, "min": 2.5, "max": 5.2},
        "pqc": {"avg": 167.67, "min": 150.2, "max": 185.5},
        "hybrid": {"avg": 159.42, "min": 142.8, "max": 176.3},
        "overhead_percent": 4272.0
    }

@app.get("/logs")
async def get_logs():
    logs = []
    for i, req in enumerate(list(request_history)[-50:]):
        logs.append({
            "id": i,
            "timestamp": req["time"],
            "endpoint": req["endpoint"],
            "method": "GET",
            "status": req["status"],
            "latency": round(random.uniform(20, 100), 2),
            "client_ip": f"127.0.0.{random.randint(1,255)}"
        })
    return logs

@app.get("/load-test-results")
async def load_test_results():
    return {
        "total_users": 1000,
        "total_requests": 100000,
        "failures": 0,
        "success_rate": 100.0,
        "avg_latency_ms": 49,
        "p95_latency_ms": 89,
        "rps": 1700,
        "results_by_endpoint": {
            "aadhaar_verify": {"requests": 50000, "failures": 0, "avg_latency": 45, "rps": 850},
            "digilocker_fetch": {"requests": 30000, "failures": 0, "avg_latency": 52, "rps": 510},
            "upi_payment": {"requests": 20000, "failures": 0, "avg_latency": 61, "rps": 340}
        }
    }

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 KAVACH BACKEND RUNNING")
    print("📊 Active Users Counter: ENABLED")
    print("📍 http://0.0.0.0:9000")
    print("="*60 + "\n")
    uvicorn.run("mock_backend:app", host="0.0.0.0", port=9000, reload=False)