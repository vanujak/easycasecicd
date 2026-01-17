# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (utilizing cache)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Accept build argument for API URL (default to localhost if not provided)
ARG VITE_API_URL=http://localhost:4000
ENV VITE_API_URL=$VITE_API_URL

# Build the app (Vite)
RUN npm run build

# Production Stage
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
