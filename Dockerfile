# NEXORA Terminal — production image
FROM node:22-alpine AS base
WORKDIR /app

RUN addgroup -g 1001 -S nexora && adduser -S nexora -u 1001 -G nexora

COPY backend/package.json backend/package-lock.json ./backend/
WORKDIR /app/backend
RUN npm ci --omit=dev && npm cache clean --force

WORKDIR /app
COPY backend/ ./backend/
COPY frontend/ ./frontend/

ENV NODE_ENV=production
ENV PORT=8787

USER nexora
EXPOSE 8787
WORKDIR /app/backend
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8787)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
