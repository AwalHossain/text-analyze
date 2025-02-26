# Build Stage
FROM node:18-alpine as builder

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
FROM node:18-alpine

WORKDIR /usr/src/app

# Install production dependencies
RUN apk add --no-cache openssl

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