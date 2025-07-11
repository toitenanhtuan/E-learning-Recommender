# Giai đoạn 1: Build ứng dụng React
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Giai đoạn 2: Serve bằng NGINX
FROM nginx:stable-alpine
COPY --from=builder /app/build /usr/share/nginx/html

# XÓA CÁC FILE CẤU HÌNH MẶC ĐỊNH CỦA NGINX (để tránh xung đột)
RUN rm /etc/nginx/conf.d/default.conf

# SAO CHÉP FILE CẤU HÌNH MỚI CỦA CHÚNG TA VÀO
COPY nginx.conf /etc/nginx/conf.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]