# locust_working.py - Working Locust File

from locust import HttpUser, task, between

class KavachUser(HttpUser):
    wait_time = between(1, 2)
    host = "http://127.0.0.1:8000"
    
    @task(5)
    def aadhaar_verify(self):
        self.client.get("/aadhaar/verify/123456789012")
    
    @task(3)
    def digilocker_fetch(self):
        self.client.get("/digilocker/fetch/DL00000001")
    
    @task(2)
    def upi_payment(self):
        self.client.post("/upi/payment", json={
            "amount": 100,
            "from_vpa": "user@upi",
            "to_vpa": "merchant@upi"
        })
    
    @task(1)
    def health_check(self):
        self.client.get("/health")