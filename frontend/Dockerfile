# ── Stage 1: build ──────────────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Build-time env vars (baked into the Vite bundle)
ARG APP_API_URL
ARG APP_CDN_URL
ARG APP_SHOW_CEP_WARNINGS=false

ENV APP_API_URL=$APP_API_URL
ENV APP_CDN_URL=$APP_CDN_URL
ENV APP_SHOW_CEP_WARNINGS=$APP_SHOW_CEP_WARNINGS

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: production runtime (nginx) ────────────────────────
FROM nginx:1.27-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/app.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
