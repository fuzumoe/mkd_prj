# 🚀 GitHub Actions Deployment Guide for Multi-Container Heroku App

This guide shows how to automate the deployment of a multi-service app (Django + Flask + React) using **GitHub Actions** and **Heroku Container Registry**.

---

## 🧱 Prerequisites

- Docker installed locally (for testing builds)
- GitHub repository set up with:
  - `backend/Dockerfile` (Django)
  - `ai-model-api/Dockerfile` (Flask)
  - `frontend/Dockerfile` (React)
- Each service is deployed to a separate Heroku app:
  - `aurora-django-backend`
  - `aurora-flask-api`
  - `aurora-frontend`

---

## 🔐 GitHub Secrets Setup

Go to: **Repo → Settings → Secrets and Variables → Actions**

Add the following repository-level secrets:

| Secret Name             | Value (Example)                                 |
|-------------------------|--------------------------------------------------|
| `HEROKU_API_KEY`        | From `heroku auth:token`                         |
| `HEROKU_EMAIL`          | Your Heroku account email                        |
| `DJANGO_APP_NAME`       | `aurora-django-backend`                          |
| `FLASK_APP_NAME`        | `aurora-flask-api`                               |
| `FRONTEND_APP_NAME`     | `aurora-frontend`                                |

---

## 🛠 GitHub Actions Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy All Services to Heroku

on:
  push:
    branches:
      - deployment  # restrict deployment to this branch

jobs:
  deploy-django:
    name: Deploy Django Backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Log in to Heroku Container Registry
        run: echo "${{ secrets.HEROKU_API_KEY }}" | docker login --username=_ --password-stdin registry.heroku.com

      - name: Build and Push Django Image
        run: |
          docker build -t registry.heroku.com/${{ secrets.DJANGO_APP_NAME }}/web -f backend/Dockerfile .
          docker push registry.heroku.com/${{ secrets.DJANGO_APP_NAME }}/web

      - name: Release Django App
        run: heroku container:release web --app ${{ secrets.DJANGO_APP_NAME }}
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}

  deploy-flask:
    name: Deploy Flask API
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Log in to Heroku Container Registry
        run: echo "${{ secrets.HEROKU_API_KEY }}" | docker login --username=_ --password-stdin registry.heroku.com

      - name: Build and Push Flask Image
        run: |
          docker build -t registry.heroku.com/${{ secrets.FLASK_APP_NAME }}/web -f ai-model-api/Dockerfile .
          docker push registry.heroku.com/${{ secrets.FLASK_APP_NAME }}/web

      - name: Release Flask App
        run: heroku container:release web --app ${{ secrets.FLASK_APP_NAME }}
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}

  deploy-frontend:
    name: Deploy React Frontend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Log in to Heroku Container Registry
        run: echo "${{ secrets.HEROKU_API_KEY }}" | docker login --username=_ --password-stdin registry.heroku.com

      - name: Build and Push React Image
        run: |
          docker build -t registry.heroku.com/${{ secrets.FRONTEND_APP_NAME }}/web -f frontend/Dockerfile .
          docker push registry.heroku.com/${{ secrets.FRONTEND_APP_NAME }}/web

      - name: Release React App
        run: heroku container:release web --app ${{ secrets.FRONTEND_APP_NAME }}
        env:
          HEROKU_API_KEY: ${{ secrets.HEROKU_API_KEY }}
```

---

## 🛡️ Protecting Branches

To protect your `main` and `deployment` branches:

1. Go to **GitHub Repo → Settings → Branches**
2. Click **Add Rule**
3. Set branch name pattern:
   - `main` or `deployment`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals
   - ✅ Require status checks (build/test/lint)
   - ✅ Prevent force pushes
   - ✅ Prevent deletion
   - ✅ Require branches to be up to date
   - (Optional) ✅ Include administrators

---

## 📦 Deployment Strategy

- Work on `feature/*` branches
- Merge to `main` after review
- Promote to `deployment` via PR → triggers GitHub Actions

---

## ✅ Done!

Now, every push to the `deployment` branch will:
- Build Docker images
- Push them to Heroku
- Release your Django, Flask, and React apps

---