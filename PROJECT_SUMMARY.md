# Kavach — Project Summary (Simple Words)

A plain-language overview of the whole project: the problem, what we've built so
far, and what we can do next.

---

## 1. Problem Statement

Today's internet security (banking, Aadhaar, DigiLocker, UPI) is protected by
cryptography like **RSA, ECDH, and AES**. These rely on math problems that normal
computers can't solve quickly.

**The threat:** A powerful **quantum computer** will be able to break RSA and ECDH
(using *Shor's algorithm*) and weaken AES (using *Grover's algorithm*). Worse,
attackers can **record encrypted data today and decrypt it later** once quantum
computers exist ("Harvest Now, Decrypt Later").

**The goal:** Build a security **gateway** ("Kavach" = shield) that protects
government-style APIs using **post-quantum cryptography (PQC)** — the new NIST
standards **ML-KEM-768** (FIPS 203) and **ML-DSA-65** (FIPS 204) — which no known
quantum algorithm can break. And show it all working live on a dashboard.

---

## 2. What We've Done So Far  ✅ (checklist)

- [x] **Mock government APIs** — fake Aadhaar / DigiLocker / UPI to test safely
      (`mock_backend.py`, port 9000).
- [x] **Kavach gateway** — a proxy that logs every request, tracks live traffic, and
      serves dashboard data (`gateway.py`, port 8000).
- [x] **React dashboard** — live UI with 7 pages (Dashboard, Live Traffic,
      Benchmarks, Load Test, Attack Status, Logs, Settings), auto-refreshing.
- [x] **Real PQC benchmarks** — measured Classical vs PQC vs Hybrid speed
      (`benchmark.py`).
- [x] **NIST correctness proof** — verified ML-KEM-768 against official NIST test
      vectors (`verify_vectors.py`).
- [x] **Quantum attack demo** — simulates Shor's/Grover's breaking classical crypto,
      then shows PQC staying safe (`quantum_attack_sim.py`).
- [x] **Load testing** — stress tests with many concurrent users
      (`load_test.py`, `locustfile.py`).
- [x] **Project cleanup** — fixed the broken Load Test page, removed a leaked dev
      key, cleaned config conflicts.
- [x] **Text encryption** — the original PQC demos worked on text.
- [x] **Image encryption** — NEW ✅
- [x] **Video encryption** — NEW ✅

---

## 3. Features Implemented

### The security scheme (how encryption actually works)
We use the same **"KEM + DEM"** design that real post-quantum systems use:

1. **ML-KEM-768** (Kyber, NIST FIPS 203) → quantum-safe **key exchange**
2. **HKDF-SHA256** → turns the shared secret into a clean **256-bit AES key**
3. **AES-256-GCM** → encrypts the actual data **and** detects tampering

Because a photo or a video is just bytes, the **same code encrypts text, images,
and video**.

### Media encryption (new)
| File | What it does |
|---|---|
| `kavach-backend/pqc_media_crypto.py` | Core library: encrypt/decrypt any bytes or file |
| `kavach-backend/encrypt_media.py` | Command-line tool: `keygen`, `encrypt`, `decrypt` |
| `kavach-backend/test_media_crypto.py` | Tests: text/image/video round-trip + security checks |
| `kavach-backend/requirements.txt` | All dependencies in one place |

**What it guarantees (tested & verified):**
- Encrypt → decrypt gives back the **exact same file** (byte-for-byte).
- **Wrong key** → decryption is rejected.
- **Tampered file** → decryption is rejected (AES-GCM catches it).
- Constant tiny **~1.1 KB overhead** no matter how big the file is.
- Secret keys saved with locked-down `0600` permissions; keys/ciphertext are
  git-ignored so they're never committed.

**How to use it:**
```bash
cd kavach-backend
pip install -r requirements.txt

python3 encrypt_media.py keygen  --out keys/kavach
python3 encrypt_media.py encrypt --pub keys/kavach.pub --in photo.png --out photo.png.kvch
python3 encrypt_media.py decrypt --sec keys/kavach.key --in photo.png.kvch --out photo_out.png
# the same 3 commands work for clip.mp4, notes.txt, and any file

python3 test_media_crypto.py   # prove it all works
```

### Dashboard / gateway
- New endpoint `GET /api/media-crypto` tells the dashboard that images and video
  (not just text) are protected.

---

## 4. What Else We Can Do (Future Improvements)

Ideas to make the project stronger, roughly easy → advanced:

### A. Make the encryption more usable
- [ ] **Dashboard upload page** — drag a photo or video into the UI, see it get
      encrypted/decrypted in the browser (calls the gateway).
- [ ] **Streaming/chunked encryption** — encrypt very large videos in pieces so we
      don't load the whole file into memory.
- [ ] **Progress bar + file previews** for big media files.

### B. Make it "real" instead of a demo
- [ ] **Encrypt inside the gateway path** — right now the gateway only *proxies*
      plaintext. Actually apply PQC to real request/response bodies.
- [ ] **Sign the files with ML-DSA-65** — add a digital signature so the receiver
      can prove *who* sent the file (authenticity), not just secrecy.
- [ ] **Turn on HTTPS/TLS** for the gateway (currently plain HTTP).
- [ ] **Real load-test numbers** — the Load Test page shows canned figures; wire it
      to actual Locust runs.

### C. Key management (important for real use)
- [ ] **Key rotation** and expiry.
- [ ] **Password-protect the secret key** (encrypt the `.key` file itself).
- [ ] **Store keys in a proper vault** instead of local files.

### D. Polish & proof
- [ ] **Automated tests in CI** (GitHub Actions) that run `test_media_crypto.py` and
      `verify_vectors.py` on every push.
- [ ] **Fix the Windows-only path** in `verify_vectors.py` so it runs on Mac/Linux.
- [ ] **Compare file sizes/timing** for image vs video encryption on the Benchmarks
      page.
- [ ] **Short demo video / screenshots** in the README.

---

## 5. One-Line Summary

Kavach is a quantum-safe security shield: it now protects **text, images, and
video** using NIST-approved post-quantum cryptography (ML-KEM-768 + AES-256-GCM),
proven correct against official NIST test vectors, with a live dashboard — and there
are clear next steps to turn the demo into a fully production-grade system.
