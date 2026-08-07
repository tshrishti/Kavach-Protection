#!/usr/bin/env python3
"""
encrypt_media.py — Kavach CLI to quantum-safe encrypt/decrypt files.

Works on TEXT, IMAGES and VIDEO (any file is just bytes). Uses the hybrid
ML-KEM-768 + AES-256-GCM scheme in pqc_media_crypto.py.

Usage
-----
  # 1. Make a recipient keypair (once)
  python3 encrypt_media.py keygen --out keys/kavach

  # 2. Encrypt any file with the PUBLIC key
  python3 encrypt_media.py encrypt --pub keys/kavach.pub \
        --in photo.png --out photo.png.kvch

  # 3. Decrypt with the SECRET key
  python3 encrypt_media.py decrypt --sec keys/kavach.key \
        --in photo.png.kvch --out photo_restored.png

The same three commands work for .txt, .jpg, .png, .mp4, .mov, etc.
"""

import argparse
import os
import sys
import time

import pqc_media_crypto as pqc


def _human(n: int) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.1f}{unit}" if unit != "B" else f"{n}B"
        n /= 1024


def cmd_keygen(args):
    ek, dk = pqc.generate_keypair()
    os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
    pub_path = args.out + ".pub"
    sec_path = args.out + ".key"
    with open(pub_path, "wb") as f:
        f.write(ek)
    # Secret key is sensitive — write it 0600 so only the owner can read it.
    fd = os.open(sec_path, os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
    with os.fdopen(fd, "wb") as f:
        f.write(dk)
    print(f"[+] Public key  ({_human(len(ek))}): {pub_path}")
    print(f"[+] Secret key  ({_human(len(dk))}): {sec_path}  (keep this private!)")


def cmd_encrypt(args):
    with open(args.pub, "rb") as f:
        pub = f.read()
    src_size = os.path.getsize(args.infile)
    t0 = time.time()
    out_size = pqc.encrypt_file(args.infile, args.outfile, pub)
    dt = (time.time() - t0) * 1000
    overhead = out_size - src_size
    print(f"[+] Encrypted {args.infile} -> {args.outfile}")
    print(f"    plaintext : {_human(src_size)}")
    print(f"    ciphertext: {_human(out_size)}  (+{overhead} B PQC/GCM overhead)")
    print(f"    algorithm : ML-KEM-768 + AES-256-GCM (quantum-safe)")
    print(f"    time      : {dt:.1f} ms")


def cmd_decrypt(args):
    with open(args.sec, "rb") as f:
        sec = f.read()
    t0 = time.time()
    try:
        out_size = pqc.decrypt_file(args.infile, args.outfile, sec)
    except Exception as e:
        print(f"[!] Decryption FAILED: {e}", file=sys.stderr)
        print("    (wrong key, or the file was tampered with / corrupted)",
              file=sys.stderr)
        sys.exit(1)
    dt = (time.time() - t0) * 1000
    print(f"[+] Decrypted {args.infile} -> {args.outfile}")
    print(f"    recovered : {_human(out_size)}")
    print(f"    integrity : VERIFIED (AES-GCM auth tag OK)")
    print(f"    time      : {dt:.1f} ms")


def main():
    p = argparse.ArgumentParser(
        description="Kavach quantum-safe file encryption (text/image/video)."
    )
    sub = p.add_subparsers(dest="cmd", required=True)

    g = sub.add_parser("keygen", help="generate an ML-KEM-768 keypair")
    g.add_argument("--out", required=True,
                   help="output prefix (writes <out>.pub and <out>.key)")
    g.set_defaults(func=cmd_keygen)

    e = sub.add_parser("encrypt", help="encrypt a file with a public key")
    e.add_argument("--pub", required=True, help="recipient public key (.pub)")
    e.add_argument("--in", dest="infile", required=True, help="input file")
    e.add_argument("--out", dest="outfile", required=True, help="output .kvch file")
    e.set_defaults(func=cmd_encrypt)

    d = sub.add_parser("decrypt", help="decrypt a file with a secret key")
    d.add_argument("--sec", required=True, help="recipient secret key (.key)")
    d.add_argument("--in", dest="infile", required=True, help="input .kvch file")
    d.add_argument("--out", dest="outfile", required=True, help="restored output file")
    d.set_defaults(func=cmd_decrypt)

    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
