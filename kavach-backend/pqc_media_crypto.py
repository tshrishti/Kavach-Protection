"""
pqc_media_crypto.py — Kavach hybrid post-quantum file encryption.

This is the SAME scheme real PQC systems use ("KEM + DEM"):

  1. ML-KEM-768 (Kyber, NIST FIPS 203)  -> quantum-safe KEY EXCHANGE
  2. HKDF-SHA256                          -> derive a 256-bit AES key
  3. AES-256-GCM                          -> encrypt the actual bytes (authenticated)

It works on ANY bytes, so the same code protects text, images and video.
Only the recipient's ML-KEM secret key can recover the AES key, so only they
can decrypt. GCM also detects any tampering with the ciphertext.

Container layout (single self-describing blob):

    MAGIC(5) | VERSION(1) | KEM_CT_LEN(2, BE) | KEM_CT | NONCE(12) | AES_GCM_CT
"""

from kyber_py.ml_kem import ML_KEM_768
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives import hashes
import struct
import os

MAGIC = b"KVCH2"          # Kavach media container, format v2
VERSION = 2
NONCE_LEN = 12            # 96-bit nonce, recommended for AES-GCM
AES_KEY_LEN = 32          # AES-256


# ── Key management ────────────────────────────────────────────────────────────

def generate_keypair():
    """Return (encapsulation_key, decapsulation_key) = (public, secret)."""
    ek, dk = ML_KEM_768.keygen()
    return ek, dk


def _derive_aes_key(shared_secret: bytes) -> bytes:
    """HKDF-SHA256 the ML-KEM shared secret into a clean 256-bit AES key."""
    return HKDF(
        algorithm=hashes.SHA256(),
        length=AES_KEY_LEN,
        salt=None,
        info=b"kavach-pqc-media-v2",
    ).derive(shared_secret)


# ── Core encrypt / decrypt (bytes in, bytes out) ─────────────────────────────

def encrypt_bytes(plaintext: bytes, public_key: bytes) -> bytes:
    """Hybrid-encrypt arbitrary bytes to the holder of `public_key`."""
    shared_secret, kem_ct = ML_KEM_768.encaps(public_key)
    aes_key = _derive_aes_key(shared_secret)

    nonce = os.urandom(NONCE_LEN)
    aes_ct = AESGCM(aes_key).encrypt(nonce, plaintext, MAGIC)  # MAGIC as AAD

    return (
        MAGIC
        + struct.pack("B", VERSION)
        + struct.pack(">H", len(kem_ct))
        + kem_ct
        + nonce
        + aes_ct
    )


def decrypt_bytes(blob: bytes, secret_key: bytes) -> bytes:
    """Decrypt a container produced by encrypt_bytes using `secret_key`."""
    if blob[:5] != MAGIC:
        raise ValueError("Not a Kavach container (bad magic header)")
    off = 5

    version = blob[off]
    off += 1
    if version != VERSION:
        raise ValueError(f"Unsupported container version: {version}")

    (kem_ct_len,) = struct.unpack(">H", blob[off:off + 2])
    off += 2

    kem_ct = blob[off:off + kem_ct_len]
    off += kem_ct_len

    nonce = blob[off:off + NONCE_LEN]
    off += NONCE_LEN

    aes_ct = blob[off:]

    shared_secret = ML_KEM_768.decaps(secret_key, kem_ct)
    aes_key = _derive_aes_key(shared_secret)

    return AESGCM(aes_key).decrypt(nonce, aes_ct, MAGIC)


# ── File helpers (what images / video actually use) ───────────────────────────

def encrypt_file(in_path: str, out_path: str, public_key: bytes) -> int:
    with open(in_path, "rb") as f:
        data = f.read()
    blob = encrypt_bytes(data, public_key)
    with open(out_path, "wb") as f:
        f.write(blob)
    return len(blob)


def decrypt_file(in_path: str, out_path: str, secret_key: bytes) -> int:
    with open(in_path, "rb") as f:
        blob = f.read()
    data = decrypt_bytes(blob, secret_key)
    with open(out_path, "wb") as f:
        f.write(data)
    return len(data)
