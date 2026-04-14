# ── Stage 1: build ──────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Install deps first (cache layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source & build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src/ src/
RUN npm run build

# ── Stage 2: production runtime ────────────────────────────────
FROM node:22-alpine AS production

# Non-root user for security
RUN addgroup -g 1001 -S nestjs && \
    adduser  -u 1001 -S nestjs -G nestjs

WORKDIR /app

# Production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from build stage
COPY --from=build /app/dist ./dist

# Own everything by nestjs user
RUN chown -R nestjs:nestjs /app

USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
