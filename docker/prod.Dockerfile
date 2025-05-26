# 1. Build
FROM node:16.18-alpine as builder
# Set working directory
WORKDIR /app
#
COPY package.json .
COPY package-lock.json .
# Same as npm install
RUN npm install
COPY . .
RUN npm run build

# 2. For Nginx setup
FROM nginx:1.23.1-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 5001
CMD ["nginx", "-g", "daemon off;"]
