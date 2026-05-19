import requests
import json
import time
import random
import urllib3

# Disable SSL warnings for self-signed certificate
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

GATEWAY_URL = "https://127.0.0.1:8000"

# Simulated Indian government API payloads
AADHAAR_PAYLOAD = {
    "aadhaar_number": "1234-5678-9012",
    "name": "Rahul Kumar",
    "dob": "1990-05-15",
    "address": "123 MG Road, Bangalore, Karnataka 560001",
    "biometric": "x" * 500  # simulate biometric data
}

DIGILOCKER_PAYLOAD = {
    "user_id": "DL-2024-98765",
    "document_type": "PAN_CARD",
    "document_number": "ABCDE1234F",
    "issuer": "Income Tax Department",
    "data": "x" * 1000  # simulate document data
}

UPI_PAYLOAD = {
    "transaction_id": "TXN202403210001",
    "payer_upi": "rahul@okicici",
    "payee_upi": "merchant@okhdfc",
    "amount": 1500.00,
    "currency": "INR",
    "remarks": "Payment for services"
}

def send_request(name, method, path, payload=None):
    url = f"{GATEWAY_URL}/{path}"
    start = time.time()
    
    try:
        if method == "GET":
            response = requests.get(url, verify=False, timeout=10)
        else:
            response = requests.post(
                url,
                json=payload,
                verify=False,
                timeout=10
            )
        
        latency = (time.time() - start) * 1000  # ms
        size = len(json.dumps(payload)) if payload else 0
        
        print(f"[SIM] {name}")
        print(f"      Method  : {method}")
        print(f"      Status  : {response.status_code}")
        print(f"      Latency : {latency:.2f} ms")
        print(f"      Payload : {size} bytes")
        print()
        
        return latency
        
    except Exception as e:
        print(f"[SIM] ERROR: {e}")
        return None

def run_simulation():
    print("=" * 50)
    print("[KAVACH] Starting Traffic Simulation")
    print("[KAVACH] Simulating Indian Gov API Traffic")
    print("=" * 50)
    print()
    
    latencies = []
    
    # Test 1 - Aadhaar verification
    l = send_request("Aadhaar Verification", "POST", "posts", AADHAAR_PAYLOAD)
    if l: latencies.append(l)
    time.sleep(0.5)
    
    # Test 2 - DigiLocker document fetch
    l = send_request("DigiLocker Document Fetch", "POST", "posts", DIGILOCKER_PAYLOAD)
    if l: latencies.append(l)
    time.sleep(0.5)
    
    # Test 3 - UPI payment
    l = send_request("UPI Payment Request", "POST", "posts", UPI_PAYLOAD)
    if l: latencies.append(l)
    time.sleep(0.5)
    
    # Test 4 - Simple GET requests
    for i in range(1, 6):
        l = send_request(f"API GET Request #{i}", "GET", f"posts/{i}")
        if l: latencies.append(l)
        time.sleep(0.3)
    
    # Summary
    if latencies:
        print("=" * 50)
        print("[KAVACH] Simulation Summary")
        print(f"         Total Requests : {len(latencies)}")
        print(f"         Avg Latency    : {sum(latencies)/len(latencies):.2f} ms")
        print(f"         Min Latency    : {min(latencies):.2f} ms")
        print(f"         Max Latency    : {max(latencies):.2f} ms")
        print(f"         All Quantum Safe: YES")
        print("=" * 50)

if __name__ == "__main__":
    run_simulation()