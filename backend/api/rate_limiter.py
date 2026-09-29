import time
from typing import Dict, Tuple
from fastapi import HTTPException, Request, status

class RateLimiter:
    """
    In-memory sliding window rate limiter for protecting sensitive FastAPI endpoints.
    Tracks requests per IP/User identifier over a specified window in seconds.
    """
    def __init__(self, requests_per_window: int = 10, window_seconds: int = 60):
        self.requests_per_window = requests_per_window
        self.window_seconds = window_seconds
        self.client_records: Dict[str, list] = {}

    def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown_client"
        now = time.time()
        
        if client_ip not in self.client_records:
            self.client_records[client_ip] = []
            
        # Filter out timestamps outside current window
        window_start = now - self.window_seconds
        self.client_records[client_ip] = [t for t in self.client_records[client_ip] if t > window_start]
        
        if len(self.client_records[client_ip]) >= self.requests_per_window:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded ({self.requests_per_window} requests per {self.window_seconds}s). Please wait before retrying."
            )
            
        self.client_records[client_ip].append(now)

# Pre-defined rate limiter instances for different endpoint sensitivities
login_rate_limiter = RateLimiter(requests_per_window=10, window_seconds=60)
mutation_rate_limiter = RateLimiter(requests_per_window=30, window_seconds=60)
heavy_eval_rate_limiter = RateLimiter(requests_per_window=15, window_seconds=60)
