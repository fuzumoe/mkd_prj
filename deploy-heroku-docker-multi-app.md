# 🚀 Deploy Multi‑Container App (Django + Flask + React) to Heroku via Docker

> **Repo used:** `git@github.com:fuzumoe/mkd_prj.git`
>
> **Directories inside repo:**
>
> * `backend/` — Django (ASGI)
> * `ai-model-api/` — Flask + TensorFlow
> * `frontend/` — React (Vite)

---

## 0  Prerequisites

| Tool                           | Version / Note             |
| ------------------------------ | -------------------------- |
| **Heroku CLI**                 | `heroku --version`         |
| **Docker Desktop**             | running / logged‑in        |
| Git + SSH key                  | clone private repos        |
| Billing‑enabled Heroku account | to use **container** stack |

```bash
# Clone the repo
$ git clone git@github.com:fuzumoe/mkd_prj.git
$ cd mkd_prj

# Log into Heroku services (once per machine)
$ heroku login          # opens browser
$ heroku container:login
```

---

## 1  Create one Heroku app per service

```bash
# choose unique names (example)
$ heroku create mkd-django-backend
$ heroku create mkd-flask-api
$ heroku create mkd-frontend
```

Each app automatically gets a URL like:

```
https://mkd-django-backend.herokuapp.com
https://mkd-flask-api.herokuapp.com
https://mkd-frontend.herokuapp.com
```

---

## 3  Build ➜ Push ➜ Release (one directory at a time)

### 3.1  Django backend

```bash
$ cd backend
$ heroku stack:set container   -a mkd-django-backend   # one‑time
$ heroku container:push web    -a mkd-django-backend
$ heroku container:release web -a mkd-django-backend
$ cd ..
```

### 3.2  Flask API

```bash
$ cd ai-model-api
$ heroku stack:set container   -a mkd-flask-api
$ heroku container:push web    -a mkd-flask-api
$ heroku container:release web -a mkd-flask-api
$ cd ..
```

### 3.3  React frontend

```bash
# update env for prod build
$ echo "VITE_DJANGO_API_URL=https://mkd-django-backend.herokuapp.com" > frontend/.env.production
$ echo "VITE_FLASK_API_URL=https://mkd-flask-api.herokuapp.com"     >> frontend/.env.production
$ cd frontend
$ heroku stack:set container   -a mkd-frontend
$ heroku container:push web    -a mkd-frontend
$ heroku container:release web -a mkd-frontend
$ cd ..
```

---

## 4  Configure environment variables

### Django

```bash
heroku config:set \
  DEBUG=0 \
  SECRET_KEY='9xuaBMae25t-BHXjbRzp_k4VxA1wI9U3w56VmunEt_DtG5tlIXRIREF_yCpJSlnOoQc' \
  ALLOWED_HOSTS='*' \
  DATABASE_URL='sqlite:////app/db.sqlite3' \
  -a mkd-django-backend
```

### Flask

```bash
heroku config:set \
  FLASK_DEBUG=false \
  SECRET_KEY='EZw1LLKwbtzwcQr8NCsD-_5_nOwbI_F-6fdztVZSsEv9JJ-DlNuO85mji-YbWY94hXU' \
  MODEL_PATH='/app/aurora.h5' \
  -a mkd-flask-api
```

### Frontend (runtime vars, optional)

```bash
heroku config:set \
  VITE_DJANGO_API_URL='https://mkd-django-backend.herokuapp.com' \
  VITE_FLASK_API_URL='https://mkd-flask-api.herokuapp.com' \
  -a mkd-frontend
```

*(If the Dockerfile bakes env during build you can skip these.)*

---

## 5  Smoke‑test & Logs

```bash
# Open in browser
heroku open -a mkd-frontend            # SPA
heroku open -a mkd-django-backend       # Django root
heroku open -a mkd-flask-api            # Flask root

# Live logs
heroku logs --tail -a mkd-frontend
heroku logs --tail -a mkd-django-backend
heroku logs --tail -a mkd-flask-api

# Dyno status
heroku ps -a mkd-flask-api
```

Expect:

* **Django**: Uvicorn on `$PORT`, memory \~250 MB
* **Flask**: Gunicorn 1 worker, memory \~300 MB (no R14/R15)
* **Frontend**: nginx binding `${PORT}`

---

## 6  Optional scaling & addons

```bash
# Bigger dyno for API (1 GB RAM)
heroku ps:type standard-2x -a mkd-flask-api

# Postgres instead of SQLite
heroku addons:create heroku-postgresql:hobby-dev -a mkd-django-backend

# Redis (if used)
heroku addons:create heroku-redis:hobby-dev -a mkd-flask-api
```

---
