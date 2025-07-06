FROM python:3.11-slim

# ───── runtime flags ───────────────────────────────────────────
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# ───── system build tools ──────────────────────────────────────
RUN apt-get update \
    && apt-get install -y build-essential curl \
    && rm -rf /var/lib/apt/lists/*

# ───── dependency manager (uv) ─────────────────────────────────
RUN pip install --upgrade pip uv

# ───── project files & deps ────────────────────────────────────
COPY ./ ./

# Generate requirements.txt from pyproject/poetry.lock/pip-tools, then install
RUN uv export --no-hashes --format requirements-txt > requirements.txt
RUN sed '/^\(file:\/\/\/app\|-e \.\)/d' requirements.txt > reqs-external.txt \
 && pip install --no-cache-dir -r reqs-external.txt

# ───── run server ──────────────────────────────────────────────
# NOTE: the sh -c wrapper lets the shell expand $PORT at runtime.
CMD ["sh", "-c", "uvicorn myproject.asgi:application --host 0.0.0.0 --port $PORT"]
