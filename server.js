let quests = []

// Khai báo sử dụng thư viện Express
const express = require('express');
const app = express();
const PORT = 3000;

// 1. Phục vụ các file tĩnh (Static Files)
// Lệnh này nói với Server: "Nếu ai đó truy cập web, hãy gửi toàn bộ file trong thư mục 'public' cho họ"
app.use(express.static('public'));
app.use(express.json()); // Middleware để phân tích JSON từ body của request

// API lấy danh sách 
app.get('/api/quests', (req, res) => {
    res.json(quests);
});

app.post('/api/quests', (req, res) => {
    const newQuest = req.body;
    quests.push(newQuest);
    res.status(201).json(newQuest);
}); 

app.put('/api/quests/:id', (req, res) => {
    const questId = Number(req.params.id);
    const quest = quests.find(quest => quest.id === questId);

    if (quest) {
        quest.completed = !quest.completed; // Đảo ngược trạng thái completed
        res.json(quest);
    } else {
        res.status(404).json({ message: 'Nhiệm vụ không tồn tại!' });
    }
});

app.delete('/api/quests/:id', (req, res) => {
    const questId = Number(req.params.id);
    quests = quests.filter(quest => quest.id !== questId);
    res.json({ success: true, message: 'Nhiệm vụ đã được xóa!' });

});

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

// 3. Khởi động Server, lắng nghe tại cổng 3000
app.listen(PORT, () => {
    console.log(`🚀 Server game đang chạy tại địa chỉ: http://localhost:${PORT}`);
});