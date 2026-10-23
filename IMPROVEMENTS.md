# Improvements

## Applied
- Dockerfile + docker-compose (non-root user, HEALTHCHECK)
- Node 22 via .nvmrc + package engines
- package.json scripts: check:syntax, check:all, audit:prod
- CI: syntax + tests + production audit
- GET /health liveness endpoint
- Graceful shutdown (SIGTERM / SIGINT)
- Clearer .env.example

## Next
- Split server.js into routes/ + middleware/
- Optional Redis for job nonces (multi-instance)
- Structured logger (pino)
- Dependabot + CodeQL
