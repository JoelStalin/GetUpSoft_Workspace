# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /build

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Stage 2: Runtime (nginx + static assets)
FROM nginx:1.25-alpine

LABEL maintainer="GetUpSoft DevOps Team"
LABEL description="GetUpSoft Corporate Site - React/Vite SPA"
LABEL version="0.1.0"

# Create non-root user
RUN addgroup -g 1000 nginx-user && \
    adduser -D -u 1000 -G nginx-user nginx-user

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /build/dist /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Set proper permissions
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html && \
    chown -R nginx-user:nginx-user /var/cache/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-user:nginx-user /var/run/nginx.pid

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5173/health 2>/dev/null || exit 1

USER nginx-user

EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]
