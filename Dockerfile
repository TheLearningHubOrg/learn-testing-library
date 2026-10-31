# Production Dockerfile for the Testing Library Playground
# Stage 1 installs, type-checks and runs the Vitest suite; the image only builds if every test passes.
FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json vite.config.ts index.html ./
COPY src ./src
COPY tests ./tests
ENV CI=true
RUN npm test && npm run build

# Stage 2 serves the static bundle with nginx.
FROM nginx:stable-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ >/dev/null || exit 1
