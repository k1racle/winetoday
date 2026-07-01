FROM node:22-alpine

WORKDIR /app

COPY web/package.json web/package-lock.json* ./
RUN npm ci

COPY web/ .
COPY icons/ ./public/icons/
RUN npm run build

EXPOSE 3000

ENV NITRO_PORT=3000
ENV NUXT_HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
