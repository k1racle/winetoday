FROM node:22-alpine

RUN apk add --no-cache libc6-compat vips-dev libheif-dev libavif-dev build-base

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

ENV NODE_ENV=production
ENV PORT=4001
ENV UPLOADS_DIR=/app/uploads

EXPOSE 4001

CMD ["node", "dist/main.js"]
