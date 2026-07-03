FROM node:22-alpine

RUN apk add --no-cache libc6-compat

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
