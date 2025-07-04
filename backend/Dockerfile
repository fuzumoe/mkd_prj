FROM python:3.11-slim

# avoid .pyc files, unbuffered output
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# install system build tools
RUN apt-get update \
    && apt-get install -y build-essential curl \
    && rm -rf /var/lib/apt/lists/*

# install uv itself
RUN pip install --upgrade pip uv

# copy only your lock & project spec
COPY backend/    ./


# sync all deps (including dev – e.g. mypy) and export a requirements.txt
RUN uv export --no-hashes --format requirements-txt > requirements.txt

# RUN pip install -r requirements.txt
RUN sed '/^\(file:\/\/\/app\|-e \.\)/d' requirements.txt > reqs-external.txt \
 && pip install --no-cache-dir -r reqs-external.txt

# Expose port
EXPOSE 8000

 
# Default command - use uvicorn ASGI server
CMD ["uvicorn", "myproject.asgi:application", "--host", "0.0.0.0", "--port", "8000"]