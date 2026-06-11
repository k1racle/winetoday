FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG NEXT_PUBLIC_SITE_URL=http://localhost
ARG NEXT_PUBLIC_MEILISEARCH_URL=http://localhost/search
ARG CMS_URL=http://backend:1337
ARG STRAPI_API_TOKEN=

ENV NODE_ENV=production
ENV STRAPI_API_TOKEN=$STRAPI_API_TOKEN
ENV NEXT_TELEMETRY_DISABLED=1
ENV CMS_URL=$CMS_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_MEILISEARCH_URL=$NEXT_PUBLIC_MEILISEARCH_URL

RUN NODE_OPTIONS="--max-old-space-size=2048" npm run build

EXPOSE 3000

CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"]
