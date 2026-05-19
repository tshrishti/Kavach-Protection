# locustfile.py - Kavach Load Test

import random
import urllib3
from locust import HttpUser, task, between, events

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

AADHAAR_IDS = [f"{i:012d}" for i in range(100000000001, 100000000021)]
DIGILOCKER_IDS = [f"DL{i:08d}" for i in range(1, 21)]

class KavachUser(HttpUser):
    wait_time = between(1, 3)
    host = "http://127.0.0.1:8000"
    
    def on_start(self):
        self.client.verify = False
    
    @task(5)
    def verify_aadhaar(self):
        uid = random.choice(AADHAAR_IDS)
        with self.client.get(
            f"/aadhaar/verify/{uid}",
            timeout=30,
            catch_response=True,
            name="/aadhaar/verify/[id]"
        ) as resp:
            if resp.status_code == 200:
                resp.success()
            else:
                resp.failure(f"Failed: {resp.status_code}")
    
    @task(3)
    def fetch_digilocker(self):
        uid = random.choice(DIGILOCKER_IDS)
        with self.client.get(
            f"/digilocker/fetch/{uid}",
            timeout=30,
            catch_response=True,
            name="/digilocker/fetch/[id]"
        ) as resp:
            if resp.status_code == 200:
                resp.success()
            else:
                resp.failure(f"Failed: {resp.status_code}")
    
    @task(2)
    def upi_payment(self):
        payload = {
            "amount": round(random.uniform(10, 10000), 2),
            "from_vpa": f"user{random.randint(1,100)}@upi",
            "to_vpa": "merchant@upi",
            "remark": "Test payment"
        }
        with self.client.post(
            "/upi/payment",
            json=payload,
            timeout=30,
            catch_response=True,
            name="/upi/payment"
        ) as resp:
            if resp.status_code == 201 or resp.status_code == 200:
                resp.success()
            else:
                resp.failure(f"Failed: {resp.status_code}")

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print("\n" + "="*60)
    print("   KAVACH LOCUST LOAD TEST STARTING")
    print("   Target: http://127.0.0.1:8000")
    print("="*60 + "\n")