# Stage 1: Build React/Vite App
FROM node:20-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

# Copy full source
COPY . .

# Build the app to /dist (The API URL is built into the output via VITE_API_BASE_URL)
# Docker-compose will supply this ARG
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# Stage 2: Serve via Nginx Alpine
FROM nginx:alpine

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Custom Nginx configuration is injected by docker-compose mapping
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
