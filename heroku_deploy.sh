#!/usr/bin/env bash
set -Eeuo pipefail
trap 'echo "❌  Error on line $LINENO. Exiting."' ERR

# Load environment variables from .env file
if [[ -f .env ]]; then
  echo "📝  Loading environment variables from .env file..."
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | xargs)
fi

DJANGO_APP="mkd-django-backend"
FLASK_APP="mkd-flask-api"
FRONT_APP="mkd-frontend"

# Use STRIPE_SECRET_KEY from .env file
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-sk_test_CHANGE_ME}"

# Track successful deployments
declare -a DEPLOYED_APPS=()

login() {
  echo "🔑  Logging in to Heroku using API key from .env..."
  
  # Check if HEROKU_API_KEY is set
  if [[ -z "${HEROKU_API_KEY:-}" ]]; then
    echo "❌  HEROKU_API_KEY not found in environment variables"
    echo "💡  Please add HEROKU_API_KEY to your .env file"
    exit 1
  fi
  
  # Login to Heroku Container Registry using API key
  echo "$HEROKU_API_KEY" | docker login --username=_ --password-stdin registry.heroku.com
  
  # Set API key for heroku CLI
  export HEROKU_API_KEY
  
  # Verify login worked
  if ! heroku auth:whoami >/dev/null 2>&1; then
    echo "❌  Heroku authentication failed"
    echo "💡  Please check your HEROKU_API_KEY in .env file"
    exit 1
  fi
  
  echo "✅  Successfully authenticated with Heroku"
}

ensure_app() {
  local app="$1"
  echo "🏗️  Ensuring app $app exists..."
  
  if ! heroku apps:info -a "$app" >/dev/null 2>&1; then
    echo "📦  Creating app $app..."
    if heroku create "$app" >/dev/null 2>&1; then
      echo "✅  Successfully created app $app"
    else
      echo "❌  Failed to create app $app"
      return 1
    fi
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
  
  # Verify STRIPE_SECRET_KEY is available
  if [[ -z "${STRIPE_SECRET_KEY:-}" ]]; then
    echo "⚠️  STRIPE_SECRET_KEY not found in environment variables"
    echo "💡  Using default placeholder value"
    STRIPE_SECRET_KEY="sk_test_CHANGE_ME"
  fi
  
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
  local pushed=false
  local should_release=false

  echo "🚀  Deploying $app from ./$dir"
  
  # Check if app already exists and is running
  if heroku apps:info -a "$app" >/dev/null 2>&1; then
    echo "ℹ️  App $app already exists, checking if it's running..."
    if heroku ps -a "$app" | grep -q "web.*up\|web.*idle"; then
      echo "✅  App $app is already running - deployment skipped"
      DEPLOYED_APPS+=("$app")
      return 0
    else
      echo "🔄  App $app exists but not running, continuing with deployment..."
    fi
  fi
  
  if ! ensure_app "$app"; then
    echo "❌  Failed to ensure app $app exists, skipping deployment"
    return 1
  fi

  # Set config vars BEFORE deploying to avoid restart after deployment
  if [[ "$app" == "$DJANGO_APP" ]]; then
    setup_config_vars "$app"
  fi

  (
    cd "$dir"
    [[ -f Dockerfile ]] || { echo "❌  No Dockerfile in $dir"; exit 1; }
    
    # Always try to push the container
    echo "🐳  Pushing container for $app..."
    if heroku container:push web -a "$app"; then
      echo "✅  Container push successful for $app"
      pushed=true
      should_release=true
    else
      echo "❌  Container push failed for $app"
      # Check if there's an existing image we can release
      if heroku container:release web -a "$app" --dry-run >/dev/null 2>&1; then
        echo "💭  Found existing container image, will attempt to release it"
        should_release=true
      else
        echo "❌  No existing container image found, cannot release"
        should_release=false
      fi
    fi
    
    # Only release if we have something to release
    if [[ "$should_release" == true ]]; then
      echo "🚀  Releasing container for $app..."
      if heroku container:release web -a "$app"; then
        echo "✅  Container release successful for $app"
        DEPLOYED_APPS+=("$app")
      else
        echo "❌  Container release failed for $app"
        return 1
      fi
    else
      echo "💭  Skipping release - no container available"
      return 1
    fi
  )
}

build_frontend() {
  local api_dj="https://${DJANGO_APP}.herokuapp.com"
  local api_fl="https://${FLASK_APP}.herokuapp.com"
  local pushed=false
  local should_release=false

  # Check if app already exists and is running
  if heroku apps:info -a "$FRONT_APP" >/dev/null 2>&1; then
    echo "ℹ️  Frontend app $FRONT_APP already exists, checking if it's running..."
    if heroku ps -a "$FRONT_APP" | grep -q "web.*up\|web.*idle"; then
      echo "✅  Frontend app $FRONT_APP is already running - deployment skipped"
      DEPLOYED_APPS+=("$FRONT_APP")
      return 0
    else
      echo "🔄  Frontend app $FRONT_APP exists but not running, continuing with deployment..."
    fi
  fi

  if ! ensure_app "$FRONT_APP"; then
    echo "❌  Failed to ensure app $FRONT_APP exists, skipping deployment"
    return 1
  fi

  echo "🏗️  Building frontend container..."
  if docker build \
    -t "registry.heroku.com/${FRONT_APP}/web" \
    --build-arg VITE_DJANGO_API_URL="$api_dj" \
    --build-arg VITE_FLASK_API_URL="$api_fl" \
    -f frontend/Dockerfile frontend; then
    echo "✅  Frontend container build successful"
  else
    echo "❌  Frontend container build failed"
    return 1
  fi

  # Push the container
  echo "🐳  Pushing frontend container..."
  if docker push "registry.heroku.com/${FRONT_APP}/web"; then
    echo "✅  Frontend container push successful"
    pushed=true
    should_release=true
  else
    echo "❌  Frontend container push failed"
    # Check if there's an existing image we can release
    if heroku container:release web -a "$FRONT_APP" --dry-run >/dev/null 2>&1; then
      echo "💭  Found existing container image, will attempt to release it"
      should_release=true
    else
      echo "❌  No existing container image found, cannot release"
      should_release=false
    fi
  fi
  
  # Only release if we have something to release
  if [[ "$should_release" == true ]]; then
    echo "🚀  Releasing frontend container..."
    if heroku container:release web -a "$FRONT_APP"; then
      echo "✅  Frontend container release successful"
      DEPLOYED_APPS+=("$FRONT_APP")
    else
      echo "❌  Frontend container release failed"
      return 1
    fi
  else
    echo "💭  Skipping release - no container available"
    return 1
  fi
}

# Function to ensure all apps are released after deployment
ensure_all_released() {
  if [[ ${#DEPLOYED_APPS[@]} -eq 0 ]]; then
    echo "💭  No apps were successfully deployed, skipping release check"
    return 0
  fi
  
  echo "🔄  Ensuring all containers are properly released..."
  
  for app in "${DEPLOYED_APPS[@]}"; do
    if heroku apps:info -a "$app" >/dev/null 2>&1; then
      echo "🔍  Checking release status for $app..."
      
      # Check if app has a running dyno
      if heroku ps -a "$app" | grep -q "web.*up\|web.*idle"; then
        echo "✅  $app is already running"
      else
        echo "⚠️  $app is not running, attempting to release..."
        
        # Try to release the container
        if heroku container:release web -a "$app"; then
          echo "✅  Successfully released $app"
        else
          echo "❌  Failed to release $app"
        fi
      fi
    else
      echo "💭  $app not found, skipping release check"
    fi
  done
}

main() {
  login

  # Remove and deploy backend
  echo "🧹  Removing existing Django backend..."
  if heroku apps:destroy -a "$DJANGO_APP" --confirm "$DJANGO_APP" >/dev/null 2>&1; then
    echo "✅  Django app removed successfully"
  else
    echo "ℹ️  Django app doesn't exist or already removed"
  fi
  
  if deploy_directory backend "$DJANGO_APP"; then
    echo "✅  Django deployment successful"
  else
    echo "💭  Django deployment failed or skipped"
  fi
  
  # Remove and deploy Flask API
  echo "🧹  Removing existing Flask API..."
  if heroku apps:destroy -a "$FLASK_APP" --confirm "$FLASK_APP" >/dev/null 2>&1; then
    echo "✅  Flask app removed successfully"
  else
    echo "ℹ️  Flask app doesn't exist or already removed"
  fi
  
  if deploy_directory ai-model-api "$FLASK_APP"; then
    echo "✅  Flask deployment successful"
  else
    echo "💭  Flask deployment failed or skipped"
  fi

  # Remove and build frontend
  echo "🧹  Removing existing Frontend..."
  if heroku apps:destroy -a "$FRONT_APP" --confirm "$FRONT_APP" >/dev/null 2>&1; then
    echo "✅  Frontend app removed successfully"
  else
    echo "ℹ️  Frontend app doesn't exist or already removed"
  fi
  
  if build_frontend; then
    echo "✅  Frontend deployment successful"
  else
    echo "💭  Frontend deployment failed or skipped"
  fi

  # Ensure all apps are properly released
  ensure_all_released

  # Only wait if we have successfully deployed apps
  if [[ ${#DEPLOYED_APPS[@]} -gt 0 ]]; then
    echo "⏳  Waiting for releases to take effect..."
    echo "📊  Successfully deployed apps: ${DEPLOYED_APPS[*]}"
    sleep 10
  else
    echo "💭  No apps were successfully deployed, skipping wait"
  fi

  # Get the actual deployed URLs (only for successfully deployed apps)
  echo "📊  Checking deployed apps..."
  
  if heroku apps:info -a "$DJANGO_APP" >/dev/null 2>&1; then
    django_url=$(heroku info -a "$DJANGO_APP" | grep "Web URL" | awk '{print $3}')
    echo "  Django  → ${django_url}health/"
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
  
  # Display deployed application URLs
  echo ""
  echo "🌐  Deployed applications:"
  
  if heroku apps:info -a "$DJANGO_APP" >/dev/null 2>&1; then
    django_url=$(heroku info -a "$DJANGO_APP" | grep "Web URL" | awk '{print $3}')
    echo "  📱  Django health: ${django_url}health/"
  fi
  
  if heroku apps:info -a "$FLASK_APP" >/dev/null 2>&1; then
    flask_url=$(heroku info -a "$FLASK_APP" | grep "Web URL" | awk '{print $3}')
    echo "  🔬  Flask health: ${flask_url}health"
  fi
  
  if heroku apps:info -a "$FRONT_APP" >/dev/null 2>&1; then
    react_url=$(heroku info -a "$FRONT_APP" | grep "Web URL" | awk '{print $3}')
    echo "  ⚛️  React frontend: ${react_url}"
  fi
}

main "$@"