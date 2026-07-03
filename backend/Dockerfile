FROM node:22-alpine

RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

COPY package.json package-lock.json ./
COPY patches ./patches

RUN npm ci --include=dev

COPY . .

ENV NODE_ENV=production
RUN npx strapi build

CMD ["sh", "-c", "node ./scripts/prepare-rich-text-blocks.js && npm run start:strapi"]
