# Multi-stage Node.js Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies only when package.json changes
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Run as non-root user for security
USER node

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "server.js"]
