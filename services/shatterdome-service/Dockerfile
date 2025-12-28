FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY src/graphql/schema/schema.graphql ./dist/graphql/schema/
COPY package*.json ./
ENV NODE_ENV=production
EXPOSE 8003
CMD ["node", "dist/server.js"]
