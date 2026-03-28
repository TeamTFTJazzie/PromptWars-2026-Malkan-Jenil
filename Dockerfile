# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Serve Stage
FROM nginx:alpine
# Copy built assets to Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Expose Port 3000 for Cloud Run
EXPOSE 3000

# Overwrite default Nginx port to 3000
RUN sed -i 's/80/3000/g' /etc/nginx/conf.d/default.conf

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
