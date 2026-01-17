FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose the API port
EXPOSE 4000

# Start server
CMD ["node", "src/server.js"]
