FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
RUN npm ci && npm ci --prefix server

COPY . .
RUN npm run test:security && npm run build

ENV HOST=0.0.0.0
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server/src/index.mjs"]
