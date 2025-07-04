# Django Backend Docker Setup

This directory contains Docker configuration for the Aurora Organics Django backend with modern ASGI server support.

## 🐳 Docker Files

### `Dockerfile`
Unified Dockerfile that supports both development and production modes using build arguments:
- **Development**: Auto-reload enabled, single worker
- **Production**: Multiple workers, optimized for performance
- Uses `uv` for fast dependency management
- Installs from `pyproject.toml` and `uv.lock`
- Runs Django with `uvicorn` ASGI server
- Includes security best practices

### Build Arguments
- `ENVIRONMENT`: Set to `development` or `production` (default: `development`)
- `WORKERS`: Number of uvicorn workers for production (default: `4`)

### Docker Compose Files
- `docker-compose.yml`: Development configuration
- `docker-compose.prod.yml`: Production overrides

## 🚀 Quick Start

### 1. Build and Run with Docker
```bash
# Development build
docker build -t aurora-django-backend .

# Production build
docker build --build-arg ENVIRONMENT=production --build-arg WORKERS=4 -t aurora-django-backend:prod .

# Run development container
docker run -p 8000:8000 aurora-django-backend

# Run production container
docker run -p 8000:8000 -e DEBUG=0 aurora-django-backend:prod
```

### 2. Use Docker Compose (Recommended)
```bash
# From project root directory
cd /path/to/aurora-organics

# Development mode
docker-compose up --build

# Production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build

# Run in background
docker-compose up -d --build

# Stop the service
docker-compose down
```

### 3. Run Locally with ASGI
```bash
# Use the provided start script
./start_asgi.sh

# Or run directly
cd myproject
uvicorn myproject.asgi:application --host 127.0.0.1 --port 8000 --reload
```

## 🔧 Configuration

### Environment Variables
- `DEBUG`: Set to 0 for production
- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: Database connection string
- `ALLOWED_HOSTS`: Comma-separated list of allowed hosts

### ASGI Server Options
The Django app runs with `uvicorn` which provides:
- ✅ High performance
- ✅ WebSocket support (if needed)
- ✅ HTTP/2 support
- ✅ Auto-reload in development
- ✅ Multiple worker processes

## 📁 File Structure
```
aurora-organics/                 # Project root
├── docker-compose.yml          # Development docker-compose
├── docker-compose.prod.yml     # Production overrides
├── pyproject.toml              # Python dependencies
├── uv.lock                     # Locked dependencies
└── backend/
    ├── Dockerfile              # Unified dev/prod Dockerfile
    ├── .dockerignore           # Docker ignore patterns
    ├── start_asgi.sh          # Local ASGI start script
    └── myproject/             # Django project
        ├── manage.py
        ├── myproject/
        │   ├── settings.py
        │   ├── asgi.py        # ASGI configuration
        │   └── ...
        └── ...
```

## 🏥 Health Checks

The containers include health checks that verify:
- Server is responding on port 8000
- Django app is properly loaded
- Database connections work

## 🔒 Security Features

- Non-root user execution
- Minimal base image (python:3.11-slim)
- No cache directories in production
- Environment variable configuration
- Health monitoring

## 🛠 Development Tips

1. **Hot Reload**: Use `--reload` flag with uvicorn for development
2. **Debug**: Set `DEBUG=1` environment variable
3. **Logs**: Use `docker-compose logs -f` to see real-time logs
4. **Shell**: Access container with `docker exec -it <container> bash`

## 📊 Performance

ASGI with uvicorn provides:
- ~3x faster than traditional WSGI
- Async request handling
- WebSocket support for real-time features
- Better resource utilization
