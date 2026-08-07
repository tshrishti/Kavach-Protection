# Kavach — Full Guide (What It Is, What's Happening, What the Dashboard Shows)
### A simple but detailed explanation, including the work done in this review session

---

## 1. The big idea (in one paragraph)

**Kavach** ("shield" / "armor") is a security **gateway** that sits in front of
important government-style APIs (like Aadhaar, DigiLocker, and UPI) and protects them
against **future quantum computers**. Today's internet security (RSA, ECDH, AES) can
be broken by a powerful enough quantum computer. Kavach demonstrates how to swap that
old cryptography for **post-quantum cryptography (PQC)** — specifically **ML-KEM-768**
and **ML-DSA-65**, the new standards approved by NIST — so data stays safe even
against quantum attacks. It also comes with a **live dashboard** that visualizes
everything in real time.

---

## 2. Why this matters — the quantum threat

Almost all secure communication today (banking, government IDs, payments) relies on
math problems that normal computers can't solve quickly:

- **RSA** and **ECDH** protect the "key exchange" (how two sides agree on a secret).
- **AES** encrypts the actual data.

A large quantum computer changes this:

| Algorithm used today | Quantum attack | What breaks |
|---|---|---|
| RSA-2048 | **Shor's algorithm** | Key exchange cracked → data exposed |
| ECDH-256 | **Shor's algorithm** | Key exchange cracked → documents exposed |
| AES-128 | **Grover's algorithm** | Security effectively halved → weakened |

There's also a real-world angle called **"Harvest Now, Decrypt Later"**: attackers
can record encrypted traffic *today* and decrypt it *later* once quantum computers
exist. So the fix is needed **now**, not after quantum computers arrive.

**Kavach's answer:** replace RSA/ECDH with **ML-KEM-768** and add **ML-DSA-65**
signatures. These are based on "lattice" math problems that **no known quantum
algorithm can break**.

---

## 3. How the system is built (the architecture)

There are **three main pieces**, all running on your own computer (localhost):

```
   Browser (You)
        |
        v
  [ React Dashboard ]        <- the pretty UI (port 3000)
        |  calls /api/...
        v
  [ Kavach Gateway ]         <- the security / proxy layer (port 8000)
        |  forwards requests
        v
  [ Mock Government APIs ]   <- fake Aadhaar / DigiLocker / UPI (port 9000)
```

### Piece 1 — Mock Government APIs (`mock_backend.py`, port 9000)
A **pretend** version of India's government services so we can test safely without
touching any real system. Endpoints include:
- `/aadhaar/verify/{uid}` — identity check
- `/digilocker/fetch/{uid}` — document fetch
- `/upi/payment` — a payment

It returns realistic fake data (names, transaction IDs, active-user counts).

### Piece 2 — Kavach Gateway (`gateway.py`, port 8000)
The **star of the show**. Every request goes *through* Kavach before reaching the
backend. It:
- **Logs every request** (time, endpoint, status, latency, client IP).
- **Tracks live traffic** for the charts.
- **Forwards** normal requests to the mock backend (the "proxy" part).
- **Serves the dashboard's data endpoints** (stats, logs, benchmarks, etc.).
- Represents where the **PQC protection** happens (ML-KEM-768 + ML-DSA-65).

### Piece 3 — React Dashboard (`kavach-dashboard/`, port 3000)
A modern web app (React 18 + Vite + Tailwind + Recharts + Lucide icons) with a dark
theme. It fetches **real data** from the gateway and **auto-refreshes** every few
seconds, so you watch things update live.

---

## 4. What each backend file does

| File | What it does |
|---|---|
| `gateway.py` | The Kavach security gateway + proxy + dashboard API endpoints |
| `mock_backend.py` | Fake Aadhaar / DigiLocker / UPI government APIs |
| `quantum_attack_sim.py` | **The "attack" demo** — simulates Shor's & Grover's breaking classical crypto, then shows Kavach staying safe |
| `benchmark.py` | Measures speed: Classical vs PQC vs Hybrid |
| `load_test.py` | Tests the system under many simultaneous users |
| `locustfile.py` | Heavy-duty load testing (10–1000 users) |
| `traffic_simulator.py` | Generates fake live traffic so the dashboard charts move |
| `verify_vectors.py` | Checks the crypto against official **NIST test vectors** (proves correctness) |
| `report.py` | Generates a written project report |

---

## 5. What the dashboard shows (page by page)

The dashboard has a fixed sidebar on the left. Every page in plain words:

### 🛡️ Dashboard (home)
The overview screen. Live key numbers:
- **Active users** — how many are currently using the system
- **Latency** — how fast requests are (milliseconds)
- **Mode** — the security mode (e.g. "hybrid-pqc")
- **RPS** — requests per second
- **Gateway status**, **pool size**, **cache size**

### 📈 Live Traffic
Real-time **line charts** of traffic, broken down by service (Aadhaar, DigiLocker,
UPI) plus a total. Updates every ~3 seconds so you watch traffic flow live.

### 📊 Benchmarks
A **performance comparison** of three approaches:
- **Classical** (old crypto) — fastest, but quantum-vulnerable
- **PQC** (post-quantum) — a bit slower, but quantum-safe
- **Hybrid** (both together) — the realistic real-world choice

It also shows the **overhead percentage** — the "price" in speed for quantum safety.
The message: safety costs only a little performance.

### ⏱️ Load Test  *(the page fixed in this session)*
Shows results of stress-testing with **1000 concurrent users**:
- Total requests, **0 failures**, 100% success rate
- Average latency, requests/second
- A per-service breakdown table (Aadhaar / DigiLocker / UPI)
- An explanation of how PQC protected each service under load

### 💀 Attack Status
A **security scoreboard**. Which algorithms a quantum computer would break:
- **RSA → broken**, **ECDH → broken**, **AES → weakened** (the danger)
- **ML-KEM → secure**, **ML-DSA → secure**, **Kavach → secure** (the protection)

This is the clearest "before vs after" visual of the whole project.

### 📄 Logs
A live **table of every request** flowing through the gateway: timestamp, endpoint,
method, status code, latency, client IP. Proves the gateway is really handling
traffic.

### ⚙️ Settings
View and change the gateway configuration: security **mode**, whether **caching** is
on, and the **artifact pool size**.

---

## 6. How the request flow actually works

1. The dashboard asks the gateway for data, e.g. `GET /api/stats`.
2. Vite (the dev server) **proxies** `/api/...` calls to the gateway at
   `http://127.0.0.1:8000` — this avoids browser security (CORS) problems.
3. The gateway responds with live JSON.
4. When a *real* service request comes in (e.g. `/aadhaar/verify/123`), the gateway
   **passes it through** to the mock backend on port 9000, then returns the result.
5. Every request is **logged** and **counted** so the charts and tables stay live.

---

## 7. What we did in this session (the work log)

You asked me to review the project and make sure it was correct. Everything that
happened:

### Review — what was checked
- Confirmed **all the frontend files exist** (App, Sidebar, PageHeader, StatCard,
  AttackSimulation, Benchmarks, API client, configs) — the "missing" files were
  actually already there.
- Verified **all 6 main dashboard pages correctly connect** to real backend
  endpoints, with auto-refresh working.
- Confirmed the **proxy configuration is correct** (dashboard → gateway → backend).

### Issues found and fixed
1. **Load Test page was broken** — it existed but wasn't linked anywhere and its
   backend endpoint was missing. → Added the route, the sidebar link, the
   `/api/load-test-results` endpoint in the gateway, and proper error handling.
2. **Tailwind conflict** — two incompatible versions were installed. → Removed the
   unused one so the build won't break.
3. **Duplicate config file** (`postcss.config.cjs`) → deleted.
4. **Two stray junk files** (`cd`, `py`) in the backend → deleted.
5. **A private key (`key.pem`) was committed to git** — a security no-no. → Removed
   it from tracking and added a `.gitignore` so it won't happen again.

### Verified
- The new backend endpoint returns `200 OK` with correct data.
- All changed frontend files compile cleanly.

### Pushed
- All fixes were committed and **pushed to your GitHub repo**
  (`tshrishti/Kavach-Protection`, commit `0e77604`).

---

## 8. How to run it (personal laptop, Node 18+)

You need **3 terminals**:

```bash
# Terminal 1 — Mock government APIs
cd kavach-backend
python3 mock_backend.py          # http://127.0.0.1:9000

# Terminal 2 — Kavach gateway
cd kavach-backend
python3 gateway.py               # http://127.0.0.1:8000

# Terminal 3 — Dashboard
cd kavach-dashboard
npm install
npm run dev                      # http://localhost:3000
```

Then open **http://localhost:3000** in your browser.

> Notes: the gateway runs over **HTTP** (`http://`), not HTTPS. First-time backend
> setup: `pip install fastapi uvicorn httpx`. The dashboard needs **Node 18+**.

---

## 9. How to test / demo it

**Best order for a demo:**

1. **Show the threat:**
   ```bash
   python3 quantum_attack_sim.py
   ```
   Watch it "break" RSA, ECDH, and AES, then show ML-KEM/ML-DSA staying safe.

2. **Show the protection:** open the dashboard and walk through the pages —
   especially **Attack Status** (before/after) and **Benchmarks** (small speed cost
   of safety).

3. **Show it live:** run the traffic simulator and watch the charts move:
   ```bash
   python3 traffic_simulator.py
   ```

**Quick backend health check:**
```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/api/stats
curl http://127.0.0.1:8000/api/attack-status
curl http://127.0.0.1:8000/api/load-test-results
```
Or use the interactive API docs at **http://127.0.0.1:8000/docs**.

---

## 10. Key facts to remember (talking points)

- Quantum computers will break **RSA, ECDH, and AES** using **Shor's** and
  **Grover's** algorithms.
- Kavach replaces them with **ML-KEM-768** (key exchange) and **ML-DSA-65**
  (signatures) — NIST standards **FIPS 203** and **FIPS 204**.
- These are **lattice-based** and have **no known quantum attack**.
- The performance cost of quantum safety is **small** (Benchmarks page).
- Everything is demonstrated **safely on localhost** — no real systems are ever
  touched.

---

*This document explains the current state of the Kavach project and the work done to
review and polish it. It is a plain-language guide for understanding and presenting
the project. (A shorter `PROJECT_OVERVIEW.md` also exists in this repo.)*

---

## 11. Media encryption — text, images AND video (new)

Earlier, the PQC demos only touched **text**. Kavach now encrypts **any file** —
text, images, and video — using the exact scheme real post-quantum systems use,
called **KEM + DEM** (a key exchange plus a data cipher):

1. **ML-KEM-768** (Kyber, NIST **FIPS 203**) does the quantum-safe **key exchange**.
2. **HKDF-SHA256** turns that shared secret into a clean **256-bit AES key**.
3. **AES-256-GCM** encrypts the actual file bytes — and *authenticates* them, so any
   tampering is detected on decryption.

Because a photo or a video is just bytes, the **same code protects all media**. Only
the holder of the ML-KEM **secret key** can decrypt.

### Files
| File | What it does |
|---|---|
| `pqc_media_crypto.py` | Core library: `encrypt_bytes` / `decrypt_bytes` / `encrypt_file` / `decrypt_file` |
| `encrypt_media.py` | Command-line tool: `keygen`, `encrypt`, `decrypt` |
| `test_media_crypto.py` | Proves text/image/video round-trip byte-for-byte and that wrong keys / tampering are rejected |

### How to use it
```bash
cd kavach-backend
pip install -r requirements.txt

# 1. Make a recipient keypair once
python3 encrypt_media.py keygen --out keys/kavach

# 2. Encrypt an image or a video with the PUBLIC key
python3 encrypt_media.py encrypt --pub keys/kavach.pub --in photo.png  --out photo.png.kvch
python3 encrypt_media.py encrypt --pub keys/kavach.pub --in clip.mp4   --out clip.mp4.kvch

# 3. Decrypt with the SECRET key
python3 encrypt_media.py decrypt --sec keys/kavach.key --in photo.png.kvch --out photo_out.png
python3 encrypt_media.py decrypt --sec keys/kavach.key --in clip.mp4.kvch  --out clip_out.mp4
```

Run the tests any time to confirm correctness:
```bash
python3 test_media_crypto.py
```

### Container format (`.kvch`)
```
MAGIC("KVCH2") | VERSION | KEM_CT_LEN | ML-KEM ciphertext | AES-GCM nonce | AES-GCM ciphertext+tag
```
The overhead is a constant **~1.1 KB** regardless of file size (the ML-KEM
ciphertext + nonce + auth tag), so encrypting a 1 GB video costs the same tiny
header as a 1 KB text file.

### Notes / security
- Secret keys are written with `0600` permissions; `*.key`, `*.pub` and `*.kvch`
  are git-ignored so keys and ciphertext are never committed.
- A new gateway endpoint `GET /api/media-crypto` advertises this capability to the
  dashboard.
- This is genuine, working cryptography (verified against NIST KAT vectors via
  `verify_vectors.py`), unlike the representational protection in the proxy path.
