#!/usr/bin/env bash
set -euo pipefail

###############################################
# 1. Pause billing by scaling dynos to zero
###############################################
echo "⏸  Scaling web dynos to 0 (stops charges)…"

echo "→ mkd-django-backend"
heroku ps:scale web=0 -a mkd-django-backend

echo "→ mkd-flask-api"
heroku ps:scale web=0 -a mkd-flask-api

echo "→ mkd-frontend"
heroku ps:scale web=0 -a mkd-frontend

echo "✅  All web dynos stopped."

###############################################
# 2. Irreversibly destroy the apps
###############################################
echo -e "\n⚠️  About to delete all three apps (this cannot be undone)."

echo "🔥 Deleting mkd-django-backend…"
heroku apps:destroy -a mkd-django-backend --confirm mkd-django-backend

echo "🔥 Deleting mkd-flask-api…"
heroku apps:destroy -a mkd-flask-api      --confirm mkd-flask-api

echo "🔥 Deleting mkd-frontend…"
heroku apps:destroy -a mkd-frontend       --confirm mkd-frontend

echo "🎉  Done. All dynos stopped and apps deleted."
