########################################
# Stage 1 – Build the React app
########################################
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build          # outputs to /app/dist (Vite) or /app/build (CRA)

########################################
# Stage 2 – Serve the static files
########################################
FROM nginx:alpine

# Copy built assets from the first stage
COPY --from=builder /app/dist /usr/share/nginx/html

# ► Heroku’s entrypoint automatically runs `envsubst`
#   on any file ending in `.template`, replacing ${PORT}.
COPY nginx.conf /etc/nginx/templates/default.conf.template

# No EXPOSE needed; Heroku ignores it anyway
CMD ["nginx", "-g", "daemon off;"]
