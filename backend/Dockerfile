FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY patches ./patches

RUN npm ci

COPY . .

RUN npm run build

CMD ["sh", "-c", "node ./scripts/prepare-rich-text-blocks.js && npm run start:strapi"]
