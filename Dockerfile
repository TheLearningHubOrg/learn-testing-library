# Production Dockerfile for the Testing Library Playground
# Stage 1 installs, type-checks and runs the Vitest suite; the image only builds if every test passes.
FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
COPY tests ./tests
ENV CI=true
RUN npm test && npm run build

# Stage 2 serves the static bundle with nginx running as a non-root user on port 8080.
FROM nginxinc/nginx-unprivileged:stable-alpine AS runner
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
