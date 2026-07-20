# 1. Tải môi trường Node.js (bản alpine siêu nhẹ để tối ưu dung lượng)
FROM node:20-alpine

# 2. Tạo một thư mục ảo tên là /app bên trong thùng chứa
WORKDIR /app

# 3. Copy file danh sách thư viện vào trước
COPY package*.json ./

# 4. Yêu cầu Docker tự động cài đặt các thư viện (như express, pg, bcryptjs...)
RUN npm install

# 5. Copy toàn bộ code (server.js, thư mục routes, public...) vào /app
COPY . .

# 6. Báo cho Docker biết Server sẽ chạy ở cổng 3000
EXPOSE 3000

# 7. Ra lệnh khởi động server khi thùng chứa được bật
CMD ["node", "server.js"]