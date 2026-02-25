# Stage 1: Build (Dùng alpine cho nhẹ)
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

# [FIX 1] Cài dependencies + Ép cài @angular/animations bản 20 để khớp với Core
RUN npm install --legacy-peer-deps && \
    npm install @angular/animations@^20.0.0 --legacy-peer-deps

COPY . .

# [FIX 2] Tự động tạo file environment.prod.ts để tránh lỗi build chết giữa chừng
RUN mkdir -p src/environments && \
    echo "export const environment = { production: true, apiUrl: '/api' };" > src/environments/environment.prod.ts

# Build source
RUN npm run build -- --configuration production

# [FIX 3] Chuẩn hóa đầu ra (Quan trọng nhất)
# Angular mới build vào "dist/tên-project/browser", lệnh này sẽ tìm và copy nó ra folder chung "/app/output"
# để Stage 2 không bị nhầm lẫn đường dẫn.
RUN mkdir /app/output && \
    (cp -r dist/*/browser/* /app/output/ 2>/dev/null || cp -r dist/*/* /app/output/)

RUN if [ -f /app/output/index.csr.html ]; then mv /app/output/index.csr.html /app/output/index.html; fi

# Stage 2: Nginx
FROM nginx:alpine

# [QUAN TRỌNG] Xóa sạch cấu hình mặc định của Nginx
RUN rm /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*

# Copy cấu hình của mình vào ĐÚNG thư mục conf.d để nó đè hoàn toàn cấu hình cũ
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy code đã build vào
COPY --from=build /app/output /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
