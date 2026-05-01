# frontend/Dockerfile

# Build phase
FROM node:22-alpine AS builder
WORKDIR /app

# Use npm ci for reproducible installs; skip global npm upgrade (fails on alpine).
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build

# Production phase with NGINX
FROM nginx:alpine
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy build files
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
