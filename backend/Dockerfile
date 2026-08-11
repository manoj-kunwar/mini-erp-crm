# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build TypeScript
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Expose the port (reads from PORT env var at runtime; default 5001)
EXPOSE ${PORT:-5001}

# Start using the existing npm start script
CMD ["npm", "run", "start"]
