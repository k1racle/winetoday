FROM node:22-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY web/package.json web/package-lock.json* ./
RUN npm ci --include=dev --no-audit --no-fund --maxsockets=1

COPY web/ .
COPY icons/ ./public/icons/

ENV NODE_ENV=production
RUN npx nuxt build

EXPOSE 3000

ENV NITRO_PORT=3000
ENV NUXT_HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
