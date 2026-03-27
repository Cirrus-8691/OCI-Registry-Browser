# syntax=docker.io/docker/dockerfile:1

FROM node:22-alpine AS base
# *******************************************

# Arguments
ARG NEXT_PUBLIC_BASE_PAGES_PATH
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_DEPLOYMENT
ARG NEXT_PUBLIC_VERSION

# https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables
#  "these public environment variables will be inlined into the JavaScript bundle during next build."
ENV NEXT_PUBLIC_BASE_PAGES_PATH=$NEXT_PUBLIC_BASE_PAGES_PATH NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH NEXT_PUBLIC_DEPLOYMENT=$NEXT_PUBLIC_DEPLOYMENT NEXT_PUBLIC_VERSION=$NEXT_PUBLIC_VERSION

FROM base AS deps
WORKDIR /app
# Install dependencies based on the preferred package manager
COPY . .

# *******************************************
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# *******************************************
RUN npm run build
# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production; NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# *******************************************
# Install Docker CLI and Cosign
RUN apk add --no-cache \
    docker-cli \
    curl \
    && curl -o /usr/local/bin/cosign -L https://github.com/sigstore/cosign/releases/latest/download/cosign-linux-amd64 \
    && chmod +x /usr/local/bin/cosign \
    && docker --version \
    && cosign version

# *******************************************
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# LES PUBLIC IMAGES
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

# *******************************************
LABEL version="0.2.1" org.opencontainers.image.authors="Cirrus-8691" org.opencontainers.image.licenses="MIT"
# *******************************************

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
ENV PORT=3000 HOSTNAME="0.0.0.0"
EXPOSE 3000

CMD ["node", "server.js"]
