"""Redis client module for caching, rate limiting, and token blacklisting."""

import json
import logging
from functools import wraps
from typing import Any, Optional

import redis
from flask import Flask, current_app, request, jsonify

logger = logging.getLogger(__name__)

# Global Redis connection instance
_redis_client: Optional[redis.Redis] = None


def init_redis(app: Flask) -> None:
    """Initialize Redis connection from Flask app config.

    Supports REDIS_URL (e.g. redis://user:pass@host:port) or individual params.

    Args:
        app: Flask application instance
    """
    global _redis_client
    try:
        redis_url = app.config.get("REDIS_URL")
        if redis_url:
            _redis_client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                retry_on_timeout=True,
            )
        else:
            _redis_client = redis.Redis(
                host=app.config.get("REDIS_HOST", "localhost"),
                port=app.config.get("REDIS_PORT", 6379),
                db=app.config.get("REDIS_DB", 0),
                password=app.config.get("REDIS_PASSWORD", None),
                decode_responses=True,
                socket_connect_timeout=5,
                retry_on_timeout=True,
            )
        _redis_client.ping()
        logger.info("Redis connection established successfully")
    except redis.ConnectionError as e:
        logger.warning(f"Redis not available, running without cache/rate-limiting: {e}")
        _redis_client = None


def get_redis() -> Optional[redis.Redis]:
    """Get the Redis client instance.

    Returns:
        Redis client or None if not connected
    """
    return _redis_client


# ---------------------------------------------------------------------------
# Rate Limiting
# ---------------------------------------------------------------------------

def rate_limit(max_requests: int = 10, window_seconds: int = 60, key_prefix: str = "rl"):
    """Rate limiting decorator using Redis sliding window.

    Limits requests per IP address. If Redis is unavailable, requests pass through.

    Args:
        max_requests: Maximum number of requests allowed in the window
        window_seconds: Time window in seconds
        key_prefix: Redis key prefix for namespacing
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            r = get_redis()
            if r is None:
                return fn(*args, **kwargs)

            client_ip = request.remote_addr or "unknown"
            key = f"{key_prefix}:{request.endpoint}:{client_ip}"

            try:
                pipe = r.pipeline()
                pipe.incr(key)
                pipe.ttl(key)
                count, ttl = pipe.execute()

                # Set expiry on first request
                if ttl == -1:
                    r.expire(key, window_seconds)

                if count > max_requests:
                    retry_after = r.ttl(key)
                    return jsonify({
                        "error": "Zbyt wiele prób. Spróbuj ponownie później.",
                        "retry_after": retry_after,
                    }), 429

            except redis.RedisError as e:
                logger.warning(f"Rate limiting error (allowing request): {e}")

            return fn(*args, **kwargs)
        return wrapper
    return decorator


# ---------------------------------------------------------------------------
# JWT Token Blacklist
# ---------------------------------------------------------------------------

def blacklist_token(jti: str, expires_in: int) -> bool:
    """Add a JWT token to the blacklist (for logout).

    Args:
        jti: JWT unique identifier
        expires_in: Seconds until the token would naturally expire

    Returns:
        True if blacklisted successfully, False otherwise
    """
    r = get_redis()
    if r is None:
        return False

    try:
        r.setex(f"bl:{jti}", expires_in, "1")
        return True
    except redis.RedisError as e:
        logger.warning(f"Failed to blacklist token: {e}")
        return False


def is_token_blacklisted(jti: str) -> bool:
    """Check if a JWT token is blacklisted.

    Args:
        jti: JWT unique identifier

    Returns:
        True if token is blacklisted
    """
    r = get_redis()
    if r is None:
        return False

    try:
        return r.exists(f"bl:{jti}") > 0
    except redis.RedisError:
        return False


# ---------------------------------------------------------------------------
# Cache helpers
# ---------------------------------------------------------------------------

def cache_get(key: str) -> Optional[Any]:
    """Get a value from Redis cache.

    Args:
        key: Cache key

    Returns:
        Deserialized value or None
    """
    r = get_redis()
    if r is None:
        return None

    try:
        data = r.get(f"cache:{key}")
        if data:
            return json.loads(data)
    except (redis.RedisError, json.JSONDecodeError) as e:
        logger.debug(f"Cache get error for {key}: {e}")

    return None


def cache_set(key: str, value: Any, ttl: int = 300) -> bool:
    """Set a value in Redis cache.

    Args:
        key: Cache key
        value: Value to cache (must be JSON-serializable)
        ttl: Time-to-live in seconds (default 5 min)

    Returns:
        True if cached successfully
    """
    r = get_redis()
    if r is None:
        return False

    try:
        r.setex(f"cache:{key}", ttl, json.dumps(value))
        return True
    except (redis.RedisError, TypeError) as e:
        logger.debug(f"Cache set error for {key}: {e}")
        return False


def cache_delete(pattern: str) -> int:
    """Delete cache entries matching a pattern.

    Args:
        pattern: Key pattern (e.g., 'user:123:*')

    Returns:
        Number of keys deleted
    """
    r = get_redis()
    if r is None:
        return 0

    try:
        keys = list(r.scan_iter(f"cache:{pattern}"))
        if keys:
            return r.delete(*keys)
    except redis.RedisError as e:
        logger.debug(f"Cache delete error for {pattern}: {e}")

    return 0
