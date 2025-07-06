# ───────── ai-model-api/Dockerfile ─────────
FROM python:3.11-slim

# ───── env flags ───────────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# ───── minimal OS deps ─────────────────────────────
RUN apt-get update \
 && apt-get install -y build-essential curl \
 && rm -rf /var/lib/apt/lists/*

# ───── fast depend­ency manager (uv) ───────────────
RUN pip install --upgrade pip uv

# ───── project files & deps ────────────────────────
COPY . .

RUN uv export --no-hashes --format requirements-txt > requirements.txt

# install only external reqs (skip editable / file://)
RUN sed '/^\(file:\/\/\/app\|-e \.\)/d' requirements.txt > reqs-external.txt \
 && pip install --no-cache-dir -r reqs-external.txt \
 # OPTIONAL: save 300 MB by swapping GPU TF for CPU TF
 && pip uninstall -y tensorflow && pip install --no-cache-dir tensorflow-cpu

# ───── health-check (same path) ────────────────────
HEALTHCHECK --interval=30s --timeout=30s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:${PORT:-5000}/predict || exit 1

# ───── run Gunicorn ────────────────────────────────
#  • bind to $PORT (Heroku injects it at runtime)
#  • 1 worker, 4 threads  →  ~300-350 MB RSS
CMD ["sh", "-c", "gunicorn wsgi:app --bind 0.0.0.0:$PORT --workers 1 --threads 4 --timeout 120"]
 