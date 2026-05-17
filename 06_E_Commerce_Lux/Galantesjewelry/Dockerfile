FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build from a normalized project root. This repository stores deployable Next.js
# sources in ./Galantesjewelry while package metadata and some shared assets live
# at the outer root. Materialize a clean /project tree so Turbopack sees one
# consistent app/lib/src layout.
RUN rm -rf /project \
    && mkdir -p /project \
    && cp package.json package-lock.json next.config.ts tsconfig.json next-env.d.ts postcss.config.mjs eslint.config.mjs proxy.ts /project/ \
    && cp -a public /project/public \
    && cp -a src /project/src \
    && ln -sfn /project/src /src \
    && if [ -d server ]; then cp -a server /project/server; fi \
    && if [ -d data ]; then cp -a data /project/data; else mkdir -p /project/data; fi \
    && if [ -d Galantesjewelry/app ]; then cp -a Galantesjewelry/app /project/app; fi \
    && for dir in components context controllers docs infra integration-contracts lib automation; do \
         if [ -d "Galantesjewelry/$dir" ]; then cp -a "Galantesjewelry/$dir" "/project/$dir"; fi; \
       done \
    && cp -a node_modules /project/node_modules

ARG NODE_OPTIONS=--max-old-space-size=4096
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=$NODE_OPTIONS
WORKDIR /project
RUN npm run build

FROM base AS runner
WORKDIR /app

RUN apk add --no-cache libc6-compat

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV APP_DATA_DIR=/app/data

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /project/public ./public
COPY --from=builder --chown=nextjs:nodejs /project/data ./data
COPY --from=builder --chown=nextjs:nodejs /project/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /project/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /project/.next/static ./app/.next/static

RUN mkdir -p /app/data/blobs && chown -R nextjs:nodejs /app/data && chmod -R 775 /app/data

USER nextjs

EXPOSE 3000

CMD ["node", "project/server.js"]
