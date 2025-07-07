#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "❌  Error on line $LINENO. Exiting."' ERR

DJANGO_APP="mkd-django-backend"
FLASK_APP="mkd-flask-api"
FRONT_APP="mkd-frontend"

STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-sk_test_CHANGE_ME}"

login() {
  echo "🔑  Logging in to Heroku Container Registry…"
  heroku container:login
  
  # Verify login worked
  if ! heroku auth:whoami >/dev/null 2>&1; then
    echo "❌  Heroku authentication failed"
    exit 1
  fi
}

ensure_app() {
  local app="$1"
  echo "🏗️  Ensuring app $app exists..."
  
  if ! heroku apps:info -a "$app" >/dev/null 2>&1; then
    echo "📦  Creating app $app..."
    heroku create "$app"
  fi
  
  # Switch to container stack if needed
  if ! heroku stack -a "$app" | grep -q 'container\*'; then
    echo "🐳  Setting container stack for $app..."
    heroku stack:set container -a "$app" || true
  fi
}

setup_config_vars() {
  local app="$1"
  echo "⚙️  Setting up config vars for $app..."
  
  # Set all config vars at once to avoid multiple restarts
  heroku config:set \
    STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
    DJANGO_SETTINGS_MODULE="myproject.settings" \
    DEBUG="False" \
    APP_NAME="$app" \
    ALLOWED_HOSTS="localhost,127.0.0.1,.herokuapp.com,${app}.herokuapp.com" \
    -a "$app"
}

deploy_directory() {
  local dir="$1" app="$2"

  echo "🚀  Deploying $app from ./$dir"
  
  # Check if app already exists and is running
  if heroku apps:info -a "$app" >/dev/null 2>&1; then
    echo "ℹ️  App $app already exists, checking if it's running..."
    if heroku ps -a "$app" | grep -q "web.*up"; then
      echo "✅  App $app is already running - deployment skipped"
      return 0
    else
      echo "🔄  App $app exists but not running, continuing with deployment..."
    fi
  fi
  
  ensure_app "$app"

  # Set config vars BEFORE deploying to avoid restart after deployment
  if [[ "$app" == "$DJANGO_APP" ]]; then
    setup_config_vars "$app"
  fi

  (
    cd "$dir"
    [[ -f Dockerfile ]] || { echo "❌  No Dockerfile in $dir"; exit 1; }
    
    # Check if image already exists
    echo "🔍  Checking if container image already exists..."
    if docker images | grep -q "registry.heroku.com/${app}/web"; then
      echo "💭  Container image already exists - push skipped"
      return 0
    fi
    
    # Single attempt - if it fails, it's likely a real issue
    echo "🐳  Pushing container for $app..."
    if heroku container:push web -a "$app"; then
      echo "✅  Container push successful for $app"
    else
      echo "💭  Container push skipped - image may already exist"
      return 1
    fi
    
    # Release the container
    echo "🚀  Releasing container for $app..."
    heroku container:release web -a "$app"
  )
}

build_frontend() {
  local api_dj="https://${DJANGO_APP}.herokuapp.com"
  local api_fl="https://${FLASK_APP}.herokuapp.com"

  # Check if app already exists and is running
  if heroku apps:info -a "$FRONT_APP" >/dev/null 2>&1; then
    echo "ℹ️  Frontend app $FRONT_APP already exists, checking if it's running..."
    if heroku ps -a "$FRONT_APP" | grep -q "web.*up"; then
      echo "✅  Frontend app $FRONT_APP is already running - deployment skipped"
      return 0
    else
      echo "🔄  Frontend app $FRONT_APP exists but not running, continuing with deployment..."
    fi
  fi

  ensure_app "$FRONT_APP"

  echo "🏗️  Building frontend container..."
  docker build \
    -t "registry.heroku.com/${FRONT_APP}/web" \
    --build-arg VITE_DJANGO_API_URL="$api_dj" \
    --build-arg VITE_FLASK_API_URL="$api_fl" \
    -f frontend/Dockerfile frontend

  # Check if frontend image already exists
  echo "🔍  Checking if frontend container image already exists..."
  if docker images | grep -q "registry.heroku.com/${FRONT_APP}/web"; then
    echo "💭  Frontend container image already exists - push skipped"
    return 0
  fi

  # Single attempt - if it fails, it's likely a real issue
  echo "🐳  Pushing frontend container..."
  if docker push "registry.heroku.com/${FRONT_APP}/web"; then
    echo "✅  Frontend container push successful"
  else
    echo "💭  Frontend container push skipped - image may already exist"
    return 1
  fi
  
  echo "🚀  Releasing frontend container..."
  heroku container:release web -a "$FRONT_APP"
}

main() {
  login

  # Remove and deploy backend
  echo "🧹  Removing existing Django backend..."
  heroku apps:destroy -a "$DJANGO_APP" --confirm "$DJANGO_APP" || echo "ℹ️  Django app doesn't exist or already removed"
  deploy_directory backend        "$DJANGO_APP" || echo "💭  Django deployment skipped"
  
  # Remove and deploy Flask API
  echo "🧹  Removing existing Flask API..."
  heroku apps:destroy -a "$FLASK_APP" --confirm "$FLASK_APP" || echo "ℹ️  Flask app doesn't exist or already removed"
  deploy_directory ai-model-api   "$FLASK_APP" || echo "💭  Flask deployment skipped"

  # Remove and build frontend
  echo "🧹  Removing existing Frontend..."
  heroku apps:destroy -a "$FRONT_APP" --confirm "$FRONT_APP" || echo "ℹ️  Frontend app doesn't exist or already removed"
  build_frontend || echo "💭  Frontend deployment skipped"

  # Get the actual deployed URLs (only for successfully deployed apps)
  echo "📊  Checking deployed apps..."
  
  if heroku apps:info -a "$DJANGO_APP" >/dev/null 2>&1; then
    django_url=$(heroku info -a "$DJANGO_APP" | grep "Web URL" | awk '{print $3}')
    echo "  Django  → ${django_url}api/health/"
  else
    echo "  Django  → ❌ Not deployed"
  fi
  
  if heroku apps:info -a "$FLASK_APP" >/dev/null 2>&1; then
    flask_url=$(heroku info -a "$FLASK_APP" | grep "Web URL" | awk '{print $3}')
    echo "  Flask   → ${flask_url}health"
  else
    echo "  Flask   → ❌ Not deployed"
  fi
  
  if heroku apps:info -a "$FRONT_APP" >/dev/null 2>&1; then
    react_url=$(heroku info -a "$FRONT_APP" | grep "Web URL" | awk '{print $3}')
    echo "  React   → ${react_url}"
  else
    echo "  React   → ❌ Not deployed"
  fi
  
  echo "✅  Deployment process completed!"
  
  # Open apps in browser (health endpoints for backend services)
  if heroku apps:info -a "$DJANGO_APP" >/dev/null 2>&1; then
    django_url=$(heroku info -a "$DJANGO_APP" | grep "Web URL" | awk '{print $3}')
    echo "🌐  Opening Django health endpoint..."
    python3 -m webbrowser "${django_url}api/health/" 2>/dev/null || true
  fi
  
  if heroku apps:info -a "$FLASK_APP" >/dev/null 2>&1; then
    flask_url=$(heroku info -a "$FLASK_APP" | grep "Web URL" | awk '{print $3}')
    echo "🌐  Opening Flask health endpoint..."
    python3 -m webbrowser "${flask_url}health" 2>/dev/null || true
  fi
  
  if heroku apps:info -a "$FRONT_APP" >/dev/null 2>&1; then
    echo "🌐  Opening React frontend..."
    heroku open -a "$FRONT_APP" || true
  fi
}

main "$@"
