# ==========================================
# STAGE 1: BASE
# ==========================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# ==========================================
# STAGE 2: BUILDER
# ==========================================
FROM base AS builder

# 🚨 Ambil HANYA package.json milik WEB
COPY apps/web/package*.json ./

RUN npm install --legacy-peer-deps

# Salin sisa kode web (app, pages, components, dll)
COPY apps/web/ ./

ENV NEXT_TELEMETRY_DISABLED=1
# Build Next.js (sekarang dia mengira dirinya bukan monorepo)
RUN npm run build

# ==========================================
# STAGE 3: RUNNER
# ==========================================
FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Karena sudah di-flatten, folder public langsung berada di /app/public
COPY --from=builder /app/public ./public

# Mode standalone Next.js meletakkan output di dalam .next/standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3001

# Eksekusi server standalone
CMD ["node", "server.js"]