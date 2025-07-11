# Giai đoạn 1: Build ứng dụng React
FROM node:16-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Giai đoạn 2: Serve bằng NGINX
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html
# Nếu bạn có file nginx.conf tùy chỉnh, hãy thêm dòng sau:
# COPY nginx.conf /etc/nginx/conf.d/default.conf 
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]