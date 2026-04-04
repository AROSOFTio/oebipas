# Stage 1: Build
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
# Note: we will use a custom nginx.conf at the composite level or rely on default routing

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
