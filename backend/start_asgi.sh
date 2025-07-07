#!/bin/bash

# Script to start Django with uvicorn ASGI server
set -e  # Exit on any error

cd "$(dirname "$0")" || exit 1

echo "🚀 Starting Django backend with uvicorn ASGI server..."

# Activate virtual environment
source ../../.venv/bin/activate

# Change to Django project directory
cd myproject || exit 1

# Run database migrations
echo "📦 Running database migrations..."
python manage.py migrate

# Collect static files (if needed in production)
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear

# Start uvicorn server
echo "🌟 Starting uvicorn server on http://127.0.0.1:8000"
uvicorn myproject.asgi:application --host 127.0.0.1 --port 8000 --reload --log-level info
