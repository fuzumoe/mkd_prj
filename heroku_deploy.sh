
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
# Configurable app names                      #
###############################################
DJANGO_APP="mkd-django-backend"
FLASK_APP="mkd-flask-api"
FRONT_APP="mkd-frontend"

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
# 3. React frontend                           #
###############################################
export VITE_DJANGO_API_URL="https://${DJANGO_APP}.herokuapp.com"
export VITE_FLASK_API_URL="https://${FLASK_APP}.herokuapp.com"

cd frontend
printf "VITE_DJANGO_API_URL=%s
" "$VITE_DJANGO_API_URL" > .env.production
printf "VITE_FLASK_API_URL=%s
" "$VITE_FLASK_API_URL"  >> .env.production

heroku apps:info -a "$FRONT_APP" >/dev/null 2>&1 || heroku create "$FRONT_APP"
heroku stack:set container -a "$FRONT_APP"
heroku container:push web    -a "$FRONT_APP"
heroku container:release web -a "$FRONT_APP"
cd ..

###############################################
# 4. Smoke tests                              #
###############################################
# Open each app in the default browser (one at a time)
heroku open -a "$DJANGO_APP"
heroku open -a "$FLASK_APP"
heroku open -a "$FRONT_APP"

echo -e "
Access your apps:
  Django Backend → https://${DJANGO_APP}.herokuapp.com
  Flask API      → https://${FLASK_APP}.herokuapp.com
  Frontend       → https://${FRONT_APP}.herokuapp.com

🎉 Deployment complete. All three apps opened in browser."