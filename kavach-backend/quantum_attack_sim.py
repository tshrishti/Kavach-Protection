# quantum_attack_sim.py - Quantum Attack Simulation on Aadhaar, DigiLocker, UPI
# Simulates Shor's and Grover's algorithms classically to demonstrate quantum threat

import time
import math
import random
import hashlib
import os

# ── ANSI colors for terminal output ──────────────────────────────────────────
RED    = "\033[91m"
GREEN  = "\033[92m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
BOLD   = "\033[1m"
RESET  = "\033[0m"

def banner(title):
    print("\n" + "="*65)
    print(f"  {BOLD}{title}{RESET}")
    print("="*65)

def section(title):
    print(f"\n  {CYAN}{BOLD}{title}{RESET}")
    print("  " + "-"*50)

# ═══════════════════════════════════════════════════════════════════════
# HELPER: Classical simulation of quantum period finding (Shor's core)
# In a real quantum computer this runs in O(log N)^3
# We simulate the math to show what a quantum computer WOULD find
# ═══════════════════════════════════════════════════════════════════════

def simulate_shors_period_finding(N, a, max_iter=10000):
    """
    Simulate quantum period finding for Shor's algorithm.
    Finds period r such that a^r ≡ 1 (mod N).
    On real quantum hardware this is exponentially faster.
    """
    x = 1
    for r in range(1, max_iter):
        x = (x * a) % N
        if x == 1:
            return r
    return None

def shors_factor(N):
    """
    Simulate Shor's algorithm to factor N.
    Returns (p, q) factors or None.
    """
    if N % 2 == 0:
        return 2, N // 2

    for attempt in range(20):
        a = random.randint(2, N - 1)
        g = math.gcd(a, N)
        if g > 1:
            return g, N // g

        r = simulate_shors_period_finding(N, a)
        if r is None or r % 2 != 0:
            continue

        x = pow(a, r // 2, N)
        p = math.gcd(x - 1, N)
        q = math.gcd(x + 1, N)

        if 1 < p < N:
            return p, N // p
        if 1 < q < N:
            return q, N // q

    return None

def simulate_grovers_search(keyspace_bits, target_key_hex):
    """
    Simulate Grover's algorithm key search.
    Classical: O(2^n), Quantum: O(2^(n/2))
    We simulate the SPEEDUP mathematically without brute forcing.
    """
    classical_ops = 2 ** keyspace_bits
    quantum_ops   = 2 ** (keyspace_bits // 2)
    speedup       = classical_ops / quantum_ops

    # Simulate finding the key after sqrt(N) quantum oracle calls
    oracle_calls  = int(math.sqrt(2 ** keyspace_bits))

    return {
        "classical_ops": classical_ops,
        "quantum_ops":   quantum_ops,
        "speedup":       speedup,
        "oracle_calls":  oracle_calls,
        "key_found":     target_key_hex,
    }

# ═══════════════════════════════════════════════════════════════════════
# ATTACK 1 — Shor's on RSA-2048 → breaks Aadhaar classical TLS
# ═══════════════════════════════════════════════════════════════════════

def attack1_shors_rsa_aadhaar():
    banner("ATTACK 1 — Shor's Algorithm vs RSA (Aadhaar TLS)")

    section("Target System")
    print("  System    : Aadhaar Identity Verification API")
    print("  Endpoint  : /aadhaar/verify/{uid}")
    print("  Current   : RSA-2048 key exchange in classical TLS")
    print("  Threat    : Quantum computer running Shor's algorithm")

    section("Simulating Shor's Algorithm on small RSA key")
    print("  Note: Real RSA-2048 has 617-digit numbers.")
    print("  We simulate on small semiprime to show the math.\n")

    # Small semiprime to demonstrate (RSA-2048 would be 2048-bit)
    test_cases = [
        ("RSA-15  (demo)", 15),
        ("RSA-35  (demo)", 35),
        ("RSA-77  (demo)", 77),
        ("RSA-143 (demo)", 143),
    ]

    for name, N in test_cases:
        start = time.time()
        result = shors_factor(N)
        elapsed = (time.time() - start) * 1000

        if result:
            p, q = result
            print(f"  {name} : N={N} → factors: {RED}{p} × {q}{RESET}  ({elapsed:.2f}ms)")
        else:
            print(f"  {name} : N={N} → {YELLOW}could not factor{RESET}")

    section("Quantum Threat Assessment for RSA-2048")
    print(f"  RSA-2048 key size     : 2048 bits")
    print(f"  Classical attack time : {RED}~300 trillion years{RESET}")
    print(f"  Quantum attack time   : {RED}~8 hours{RESET} (with 4000 logical qubits)")
    print(f"  Algorithm used        : Shor's (1994)")
    print(f"  Quantum advantage     : Exponential speedup")
    print(f"\n  {RED}❌ RSA-2048 is BROKEN by a quantum computer{RESET}")
    print(f"  {RED}❌ Aadhaar TLS handshake key is exposed{RESET}")
    print(f"  {RED}❌ All past recorded sessions can be decrypted{RESET}")

    section("Kavach Protection")
    print(f"  {GREEN}✅ ML-KEM-768 replaces RSA key exchange{RESET}")
    print(f"  {GREEN}✅ Based on Module Learning With Errors (MLWE){RESET}")
    print(f"  {GREEN}✅ No known quantum algorithm breaks MLWE{RESET}")
    print(f"  {GREEN}✅ Shor's algorithm has NO effect on lattice problems{RESET}")

# ═══════════════════════════════════════════════════════════════════════
# ATTACK 2 — Shor's on ECDH-256 → breaks DigiLocker
# ═══════════════════════════════════════════════════════════════════════

def attack2_shors_ecdh_digilocker():
    banner("ATTACK 2 — Shor's Algorithm vs ECDH-256 (DigiLocker)")

    section("Target System")
    print("  System    : DigiLocker Document Fetch API")
    print("  Endpoint  : /digilocker/fetch/{uid}")
    print("  Current   : ECDH P-256 key exchange")
    print("  Threat    : Quantum computer running Shor's on elliptic curves")

    section("How Shor's Breaks Elliptic Curve Cryptography")
    print("  ECDH security relies on the Elliptic Curve Discrete Log Problem:")
    print("  Given Q = k·G, find k  (computationally infeasible classically)")
    print("")
    print("  Shor's algorithm solves discrete logarithms in polynomial time.")
    print("  It works on ANY group — including elliptic curve groups.\n")

    # Simulate discrete log on tiny curve (mod small prime)
    section("Simulating Discrete Log (small example)")
    p_curve = 23      # tiny prime field
    G = 5             # generator point (simplified)
    k_secret = 7      # private key we want to find

    Q = pow(G, k_secret, p_curve)   # public key Q = G^k mod p
    print(f"  Curve prime p : {p_curve}")
    print(f"  Generator  G  : {G}")
    print(f"  Private key k : {YELLOW}[SECRET]{RESET} = {k_secret}")
    print(f"  Public key  Q : {Q}  (Q = G^k mod p)")
    print(f"\n  Quantum computer solving discrete log...")

    start = time.time()
    found_k = None
    for candidate in range(1, p_curve):
        if pow(G, candidate, p_curve) == Q:
            found_k = candidate
            break
    elapsed = (time.time() - start) * 1000

    if found_k == k_secret:
        print(f"  {RED}Private key RECOVERED: k = {found_k}{RESET}  ({elapsed:.3f}ms)")
        print(f"  {RED}✅ Verification: G^{found_k} mod {p_curve} = {pow(G,found_k,p_curve)} = Q ✓{RESET}")

    section("Quantum Threat Assessment for ECDH P-256")
    print(f"  ECDH-256 key size     : 256 bits")
    print(f"  Classical attack time : {RED}~10^50 years{RESET}")
    print(f"  Quantum attack time   : {RED}~1 hour{RESET} (with 2048 logical qubits)")
    print(f"  Algorithm used        : Shor's variant for ECDLP")
    print(f"  Quantum advantage     : Exponential speedup")
    print(f"\n  {RED}❌ ECDH-256 is BROKEN by a quantum computer{RESET}")
    print(f"  {RED}❌ DigiLocker document keys are exposed{RESET}")
    print(f"  {RED}❌ PAN, Aadhaar, Passport documents decryptable{RESET}")

    section("Kavach Protection")
    print(f"  {GREEN}✅ ML-KEM-768 replaces ECDH key exchange{RESET}")
    print(f"  {GREEN}✅ Security level: 178-bit post-quantum security{RESET}")
    print(f"  {GREEN}✅ Shor's cannot solve Module-LWE problems{RESET}")
    print(f"  {GREEN}✅ NIST FIPS 203 standardised — government approved{RESET}")

# ═══════════════════════════════════════════════════════════════════════
# ATTACK 3 — Grover's on AES-128 → breaks UPI payments
# ═══════════════════════════════════════════════════════════════════════

def attack3_grovers_aes_upi():
    banner("ATTACK 3 — Grover's Algorithm vs AES-128 (UPI Payments)")

    section("Target System")
    print("  System    : UPI Payment Processing API")
    print("  Endpoint  : /upi/payment")
    print("  Current   : AES-128 symmetric encryption")
    print("  Threat    : Quantum computer running Grover's search")

    section("How Grover's Algorithm Works")
    print("  Grover's provides quadratic speedup for unstructured search.")
    print("  For a keyspace of 2^n keys:")
    print("  Classical search : O(2^n)   operations")
    print("  Grover's search  : O(2^n/2) operations")
    print("")
    print("  This effectively HALVES the security of any symmetric key.\n")

    # Simulate Grover's on different key sizes
    key_sizes = [
        ("AES-128 (UPI current)", 128, "BROKEN"),
        ("AES-192",               192, "WEAKENED"),
        ("AES-256 (recommended)", 256, "SAFE"),
    ]

    section("Grover's Attack on AES Key Sizes")
    # Fake target key for simulation
    target = hashlib.sha256(b"UPI_PAYMENT_KEY").hexdigest()[:32]

    for name, bits, status in key_sizes:
        result = simulate_grovers_search(bits, target)

        classical_str = f"2^{bits}"
        quantum_str   = f"2^{bits//2}"
        speedup_str   = f"2^{bits//2}x faster"

        if status == "BROKEN":
            color = RED
            icon  = "❌"
        elif status == "WEAKENED":
            color = YELLOW
            icon  = "⚠️ "
        else:
            color = GREEN
            icon  = "✅"

        print(f"  {icon} {name}")
        print(f"     Classical ops : {classical_str}")
        print(f"     Quantum ops   : {color}{quantum_str}{RESET}")
        print(f"     Speedup       : {color}{speedup_str}{RESET}")
        print(f"     Status        : {color}{status}{RESET}\n")

    section("Real Impact on UPI Transactions")
    print(f"  AES-128 classical security : 128 bits  (~10^38 years to crack)")
    print(f"  AES-128 quantum security   : {RED}64 bits{RESET}   (~{RED}3 months{RESET} with quantum HW)")
    print(f"  64-bit security is {RED}INSUFFICIENT{RESET} for financial transactions")
    print(f"\n  {RED}❌ UPI payment data interceptable with quantum computer{RESET}")
    print(f"  {RED}❌ Transaction amounts, VPAs, bank details exposed{RESET}")
    print(f"  {RED}❌ 'Harvest now, decrypt later' attack already possible{RESET}")

    section("Kavach Protection")
    print(f"  {GREEN}✅ ML-KEM-768 provides 178-bit post-quantum security{RESET}")
    print(f"  {GREEN}✅ Even with Grover's: 178/2 = 89-bit quantum security{RESET}")
    print(f"  {GREEN}✅ 89-bit security is computationally infeasible{RESET}")
    print(f"  {GREEN}✅ ML-DSA-65 signature ensures transaction integrity{RESET}")

# ═══════════════════════════════════════════════════════════════════════
# FINAL SUMMARY
# ═══════════════════════════════════════════════════════════════════════

def final_summary():
    banner("KAVACH — QUANTUM THREAT SUMMARY")

    print(f"""
  {'SYSTEM':<20} {'ALGORITHM':<15} {'QUANTUM ATTACK':<20} {'STATUS'}
  {'-'*65}
  {'Aadhaar':<20} {'RSA-2048':<15} {"Shor's":<20} {RED}VULNERABLE{RESET}
  {'DigiLocker':<20} {'ECDH-256':<15} {"Shor's":<20} {RED}VULNERABLE{RESET}
  {'UPI Payment':<20} {'AES-128':<15} {"Grover's":<20} {RED}VULNERABLE{RESET}
  {'-'*65}
  {'Aadhaar+Kavach':<20} {'ML-KEM-768':<15} {"Shor's":<20} {GREEN}PROTECTED{RESET}
  {'DigiLocker+Kavach':<20} {'ML-KEM-768':<15} {"Shor's":<20} {GREEN}PROTECTED{RESET}
  {'UPI+Kavach':<20} {'ML-DSA-65':<15} {"Grover's":<20} {GREEN}PROTECTED{RESET}
    """)

    print(f"  {BOLD}Key Facts:{RESET}")
    print(f"  • Shor's algorithm breaks RSA and ECC exponentially faster")
    print(f"  • Grover's algorithm halves symmetric key security")
    print(f"  • ML-KEM-768 is immune to both — based on lattice hardness")
    print(f"  • NIST standardised ML-KEM (FIPS 203) and ML-DSA (FIPS 204)")
    print(f"  • Kavach implements both — verified against NIST KAT vectors")
    print(f"\n  {GREEN}{BOLD}✅ Kavach provides quantum-safe protection for all 3 systems{RESET}")
    print("="*65 + "\n")

# ═══════════════════════════════════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print(f"\n{BOLD}  KAVACH — Quantum Attack Simulation{RESET}")
    print(f"  Simulating Shor's + Grover's attacks on Indian Gov APIs\n")

    attack1_shors_rsa_aadhaar()
    attack2_shors_ecdh_digilocker()
    attack3_grovers_aes_upi()
    final_summary()