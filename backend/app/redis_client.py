# redis_client.py
import os
import redis.asyncio as redis

redis_pool = redis.ConnectionPool(
    host=os.environ.get("REDIS_HOST", "redis"),
    port=int(os.environ.get("REDIS_PORT", 6379)),
    db=0,
    decode_responses=True,
)

def get_redis() -> redis.Redis:
    return redis.Redis(connection_pool=redis_pool)