FROM node:22-alpine

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --include=dev --no-audit --no-fund --maxsockets=1

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
RUN npx nest build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
