from flask import Blueprint, jsonify

from app.redis_client import get_redis

bp = Blueprint("api", __name__, url_prefix="/api")


@bp.route("/hello-world", methods=["GET"])
def hello_world():
    return jsonify({"message": "Hello, World!"})


@bp.route("/health", methods=["GET"])
def health():
    """Health check endpoint with Redis status."""
    redis_ok = False
    r = get_redis()
    if r:
        try:
            r.ping()
            redis_ok = True
        except Exception:
            pass

    return jsonify({
        "status": "ok",
        "redis": "connected" if redis_ok else "unavailable",
    }), 200
