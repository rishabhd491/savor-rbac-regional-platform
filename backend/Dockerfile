# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma directory
COPY prisma ./prisma/

# Install ALL dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Set dummy DATABASE_URL for prisma generate
ENV DATABASE_URL="file:./dev.db"

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine

# Install libc6-compat for Prisma
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies + tools needed for seeding
RUN npm install --omit=dev --legacy-peer-deps && \
    npm install ts-node typescript --no-save --legacy-peer-deps

# Copy built files and config from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# IMPORTANT: Re-generate Prisma Client in the production stage
# This ensures the client is correctly linked to the production node_modules
# and includes the correct binary for Alpine
RUN npx prisma generate

# Set environment variables
ENV NODE_ENV=production

# Expose port (Railway will override this with its own PORT)
EXPOSE 4000

# Start command: Automate migrations and seeding on every start
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed -- --transpile-only && npm run start:prod"]
