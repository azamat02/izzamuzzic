# Stage 1: Build client
FROM node:22-alpine AS client-build
WORKDIR /build
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
COPY shared/ ./shared/
RUN cd client && npm run build

# Stage 2: Build server
FROM node:22-alpine AS server-build
WORKDIR /build
COPY server/package*.json ./server/
RUN cd server && npm ci
COPY server/ ./server/
COPY shared/ ./shared/
RUN cd server && npm run build

# Stage 3: Production
FROM node:22-alpine
RUN apk add --no-cache tini ffmpeg
WORKDIR /app

# Install production dependencies for server
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy built server
COPY --from=server-build /build/server/dist ./server/dist

# Copy built client
COPY --from=client-build /build/client/dist ./client/dist

# Copy shared
COPY shared/ ./shared/

# Create directories for persistent data
RUN mkdir -p /app/server/uploads /app/server/data

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server/dist/index.js"]
