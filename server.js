require('dotenv').config();


// Khai báo sử dụng thư viện Express
const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

const authRoutes = require('./routes/authRoutes');
const questRoutes = require('./routes/questRoutes');
// 1. Phục vụ các file tĩnh (Static Files)
// Lệnh này nói với Server: "Nếu ai đó truy cập web, hãy gửi toàn bộ file trong thư mục 'public' cho họ"
app.use(express.static('public'));
app.use(express.json()); // Middleware để phân tích JSON từ body của request
app.use('/api/auth', authRoutes); // Gắn router cho các API liên quan đến xác thực
app.use('/api/quests', questRoutes); // Gắn router cho các API liên quan đến quests
// require('./config/db'); // Thêm tạm dòng này để kích hoạt bài test kết nối
// 2. TẠO API TRÊN SERVER (Backend API Endpoint)
// Khi Client gọi tới đường dẫn '/api/monster', server sẽ chạy hàm này
app.get('/api/monster', (req, res) => {
    // Giả lập một CSDL chứa các quái vật
    const monsters = [
        { id: 1, name: "Rồng Lửa", hp: 500, type: "Boss" },
        { id: 2, name: "Quỷ Lùn Goblin", hp: 50, type: "Normal" },
        { id: 3, name: "Slime Độc", hp: 30, type: "Normal" },
        { id: 4, name: "Ma Sói Thảo Nguyên", hp: 120, type: "Elite" }
    ];

    // Thuật toán lấy ngẫu nhiên 1 con quái vật
    const randomIndex = Math.floor(Math.random() * monsters.length);
    const selectedMonster = monsters[randomIndex];

    // Trả dữ liệu về cho Client dưới định dạng JSON
    res.json(selectedMonster);
});
const sslOptions = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem')
};
const server = https.createServer(sslOptions, app);
// 3. Khởi động Server, lắng nghe tại cổng 3000
server.listen(PORT, () => {
    console.log(`🚀 Server game đang chạy tại địa chỉ: https://localhost:${PORT}`);
});