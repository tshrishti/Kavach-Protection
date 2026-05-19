# load_test.py - Kavach Threading Load Test (10 / 50 / 100 / 500 / 1000 users)

import threading
import time
import requests
import urllib3
from collections import defaultdict

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

GATEWAY     = "https://127.0.0.1:8000"
TIMEOUT     = 60
RAMP_DELAY  = 0.02

_session_local = threading.local()

def get_session():
    if not hasattr(_session_local, "session"):
        s = requests.Session()
        s.verify = False
        adapter = requests.adapters.HTTPAdapter(
            pool_connections=1,
            pool_maxsize=5,
            max_retries=urllib3.util.retry.Retry(
                total=2,
                backoff_factor=0.3,
                status_forcelist=[502, 503, 504],
            )
        )
        s.mount("https://", adapter)
        _session_local.session = s
    return _session_local.session

results      = defaultdict(list)
results_lock = threading.Lock()

def user_task(user_id: int, endpoint: str):
    session = get_session()
    url     = f"{GATEWAY}/{endpoint}/{user_id % 20}"
    start   = time.perf_counter()
    try:
        r       = session.get(url, timeout=TIMEOUT)
        elapsed = (time.perf_counter() - start) * 1000
        success = r.status_code == 200
        status  = r.status_code
    except requests.exceptions.Timeout:
        elapsed = (time.perf_counter() - start) * 1000
        success = False
        status  = "TIMEOUT"
    except Exception as e:
        elapsed = (time.perf_counter() - start) * 1000
        success = False
        status  = str(e)[:40]

    with results_lock:
        results[endpoint].append({
            "success": success, "latency_ms": elapsed,
            "user": user_id, "status": status,
        })

def run_load_test(num_users: int, endpoint: str = "aadhaar/verify"):
    print(f"\n{'='*55}")
    print(f"  Load test: {num_users} concurrent users → /{endpoint}")
    print(f"{'='*55}")

    threads = []
    for i in range(num_users):
        t = threading.Thread(target=user_task, args=(i, endpoint), daemon=True)
        threads.append(t)

    launch_start = time.perf_counter()
    for t in threads:
        t.start()
        time.sleep(RAMP_DELAY)

    for t in threads:
        t.join(timeout=TIMEOUT + 15)

    total_time = time.perf_counter() - launch_start
    batch      = results[endpoint][-num_users:]
    successes  = sum(1 for r in batch if r["success"])
    failures   = num_users - successes
    latencies  = [r["latency_ms"] for r in batch]
    avg_lat    = sum(latencies) / len(latencies) if latencies else 0
    max_lat    = max(latencies) if latencies else 0
    min_lat    = min(latencies) if latencies else 0
    p95_lat    = sorted(latencies)[int(0.95 * len(latencies)) - 1] if latencies else 0
    throughput = successes / total_time if total_time > 0 else 0

    fail_reasons = {}
    for r in batch:
        if not r["success"]:
            key = str(r["status"])
            fail_reasons[key] = fail_reasons.get(key, 0) + 1

    print(f"  Users       : {num_users}")
    print(f"  Success     : {successes}/{num_users}  ({100*successes/num_users:.1f}%)")
    print(f"  Failures    : {failures}")
    if fail_reasons:
        for reason, count in fail_reasons.items():
            print(f"    └─ {reason}: {count}")
    print(f"  Avg latency : {avg_lat:.0f}ms")
    print(f"  Min latency : {min_lat:.0f}ms")
    print(f"  P95 latency : {p95_lat:.0f}ms")
    print(f"  Max latency : {max_lat:.0f}ms")
    print(f"  Throughput  : {throughput:.1f} req/s")
    print(f"  Total time  : {total_time:.1f}s")
    return successes, num_users

if __name__ == "__main__":
    print("\n" + "="*55)
    print("   KAVACH LOAD TEST — Threading")
    print("="*55)
    print("Waiting 2s for gateway...")
    time.sleep(2)

    total_ok = total_req = 0
    for n in [10, 50, 100, 500, 1000]:
        ok, req   = run_load_test(n, "aadhaar/verify")
        total_ok  += ok
        total_req += req
        print(f"\n  Pausing 5s before next batch...")
        time.sleep(5)

    print(f"\n{'='*55}")
    print(f"   OVERALL SUMMARY")
    print(f"{'='*55}")
    print(f"  Total requests : {total_req}")
    print(f"  Total success  : {total_ok}")
    print(f"  Overall rate   : {100*total_ok/total_req:.1f}%")
    print(f"{'='*55}\n")