# Simplified Dockerfile using pre-built frontend
FROM node:18-alpine

WORKDIR /app

# Copy backend package files and install dependencies
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY backend/src ./src

# Copy the working frontend build (copy the dist folder to backend first)
COPY backend/frontend-dist ./src/frontend-dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["node", "src/server.js"]