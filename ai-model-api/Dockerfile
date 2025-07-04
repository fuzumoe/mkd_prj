FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast Python package management
RUN pip install --upgrade pip uv

# Copy Flask application code
COPY ai-model-api/ .
 
# sync all deps (including dev – e.g. mypy) and export a requirements.txt
RUN uv export --no-hashes --format requirements-txt > requirements.txt

# RUN pip install -r requirements.txt
RUN sed '/^\(file:\/\/\/app\|-e \.\)/d' requirements.txt > reqs-external.txt \
 && pip install --no-cache-dir -r reqs-external.txt


# Expose default Flask port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/predict || exit 1
 
# Run Flask application with Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "wsgi:app"]
