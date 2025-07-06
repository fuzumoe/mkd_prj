#!/usr/bin/env bash
set -euo pipefail

###############################################
# Optional git commit step                    #
###############################################
COMMIT_MSG=${COMMIT_MSG:-"chore: automated deploy to Heroku"}
if ! git diff --quiet; then
  echo "📦 Committing pending changes..."
  git add -A
  git commit -m "$COMMIT_MSG"
fi

###############################################
# Configurable app names & secrets            #
###############################################
DJANGO_APP="mkd-django-backend"
FLASK_APP="mkd-flask-api"
FRONT_APP="mkd-frontend"

# Stripe secret key (export a real one before running)
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-sk_test_CHANGE_ME}"

###############################################
# 0. Heroku Container Registry login          #
###############################################
heroku container:login

###############################################
# 1. Django backend                           #
###############################################
cd backend
heroku apps:info -a "$DJANGO_APP" >/dev/null 2>&1 || heroku create "$DJANGO_APP"
heroku stack:set container -a "$DJANGO_APP"
heroku container:push web    -a "$DJANGO_APP"
heroku container:release web -a "$DJANGO_APP"
heroku config:set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" -a "$DJANGO_APP"
cd ..

###############################################
# 2. Flask API                                #
###############################################
cd ai-model-api
heroku apps:info -a "$FLASK_APP" >/dev/null 2>&1 || heroku create "$FLASK_APP"
heroku stack:set container -a "$FLASK_APP"
heroku container:push web    -a "$FLASK_APP"
heroku container:release web -a "$FLASK_APP"
cd ..

###############################################
# 3. React frontend (build-args, no .env file) #
###############################################
VITE_DJANGO_API_URL="https://${DJANGO_APP}.herokuapp.com"
VITE_FLASK_API_URL="https://${FLASK_APP}.herokuapp.com"

# Ensure the Heroku app exists and is on container stack
heroku apps:info -a "$FRONT_APP" >/dev/null 2>&1 || heroku create "$FRONT_APP"
heroku stack:set container -a "$FRONT_APP"

# Build image locally with build-args, push, then release
docker build \
  -t registry.heroku.com/${FRONT_APP}/web \
  --build-arg VITE_DJANGO_API_URL="$VITE_DJANGO_API_URL" \
  --build-arg VITE_FLASK_API_URL="$VITE_FLASK_API_URL" \
  -f frontend/Dockerfile frontend

docker push registry.heroku.com/${FRONT_APP}/web
heroku container:release web -a "$FRONT_APP"

###############################################
# 4. Smoke tests                              #
###############################################
heroku open -a "$DJANGO_APP"
heroku open -a "$FLASK_APP"
heroku open -a "$FRONT_APP"

echo -e "
Access your apps:
  Django Backend → https://${DJANGO_APP}.herokuapp.com
  Flask API      → https://${FLASK_APP}.herokuapp.com
  Frontend       → https://${FRONT_APP}.herokuapp.com

🎉 Deployment complete. All three apps opened in browser."
