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

# Build server
RUN pnpm build:server

# Stage 2: Runtime
FROM node:20-alpine

LABEL maintainer="GetUpSoft DevOps Team"
LABEL description="Miniverse - Node.js Monorepo Server"
LABEL version="0.1.0"

# Create non-root user
RUN addgroup -g 1000 miniverse && \
    adduser -D -u 1000 -G miniverse miniverse

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /build/packages/server/dist ./

# Copy package files for runtime dependencies
COPY --from=builder /build/package.json /build/pnpm-lock.yaml ./
COPY --from=builder /build/node_modules ./node_modules

# Set permissions
RUN chown -R miniverse:miniverse /app

USER miniverse

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

EXPOSE 3000

CMD ["node", "cli.js"]
