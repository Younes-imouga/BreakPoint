FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:20-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-slim AS prod-deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY scripts ./scripts
COPY package*.json ./
EXPOSE 3000
CMD ["sh", "-c", "node scripts/seed-if-empty.js && node dist/main.js"]
