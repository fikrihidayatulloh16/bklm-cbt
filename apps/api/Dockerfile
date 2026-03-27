# ==========================================
# STAGE 1: BASE
# ==========================================
FROM node:20-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# ==========================================
# STAGE 2: BUILDER
# ==========================================
FROM base AS builder

COPY apps/api/package*.json ./
COPY apps/api/prisma ./prisma/

RUN npm install --legacy-peer-deps
COPY apps/api/ ./

# Generate Prisma menggunakan versi lokal yang pasti cocok
RUN npx prisma generate
RUN npm run build

# ==========================================
# STAGE 3: PRODUCTION DEPS
# ==========================================
FROM base AS deps

COPY apps/api/package*.json ./
COPY apps/api/prisma ./prisma/

# 🚨 PERBAIKAN: Hanya install dependencies production, JANGAN jalankan generate di sini!
RUN npm install --omit=dev --legacy-peer-deps

# ==========================================
# STAGE 4: RUNNER
# ==========================================
FROM base AS runner
ENV NODE_ENV=production

# 1. Ambil node_modules production yang bersih dan ringan
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# 2. 🚨 MAGIC TRICK: "Curi" Prisma Engine & CLI asli dari tahap Builder!
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# 3. Ambil hasil build aplikasi
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

# Eksekusi (CLI prisma yang "dicuri" tadi akan digunakan di sini)
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js db push && node dist/main.js"]