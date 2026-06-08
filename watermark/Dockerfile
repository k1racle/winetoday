FROM node:20-alpine
WORKDIR /app
RUN npm install sharp
COPY assets/logo1.png /app/assets/logo1.png
COPY worker.js /app/worker.js
COPY cleanup.js /app/cleanup.js
CMD ["node", "/app/worker.js"]
