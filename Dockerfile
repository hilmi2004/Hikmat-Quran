# Multi-stage production build for Railway from repository root
FROM node:20-alpine AS builder
WORKDIR /app
COPY server/package*.json server/tsconfig.json ./
RUN npm ci
COPY server/src/ ./src/
RUN npm run build

# Production runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

COPY server/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/server.js"]
