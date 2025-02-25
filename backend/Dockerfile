# Build Stage
FROM node:16 as builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:16-slim

WORKDIR /usr/src/app

# System dependencies
RUN apt-get update -y && \
    apt-get install -y openssl libssl1.1 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create log directory in standard location
RUN mkdir -p /usr/src/app/logs && \
    chown -R node:node /usr/src/app/logs && \
    chmod 755 /usr/src/app/logs

# Copy application files
COPY --from=builder /usr/src/app/dist ./dist
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

EXPOSE 5000

ENV NODE_ENV=production
ENV LOG_PATH=/usr/src/app/logs

USER node

CMD ["node", "dist/src/main.js"]