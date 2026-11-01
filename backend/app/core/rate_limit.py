from collections import defaultdict, deque
from time import monotonic

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

from app.core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.requests = defaultdict(deque)

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        if not settings.RATE_LIMIT_ENABLED:
            return await call_next(request)

        path = request.url.path
        if not path.startswith("/api/v1/"):
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"

        if path == "/api/v1/analyze":
            limit = settings.RATE_LIMIT_ANALYZE
        elif path == "/api/v1/chat":
            limit = settings.RATE_LIMIT_CHAT
        else:
            limit = settings.RATE_LIMIT_DEFAULT

        now = monotonic()
        window = settings.RATE_LIMIT_WINDOW_SECONDS
        key = (client_ip, path)
        timestamps = self.requests[key]

        while timestamps and now - timestamps[0] >= window:
            timestamps.popleft()

        if len(timestamps) >= limit:
            retry_after = max(1, int(window - (now - timestamps[0])))
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."},
                headers={"Retry-After": str(retry_after)},
            )

        timestamps.append(now)
        return await call_next(request)
