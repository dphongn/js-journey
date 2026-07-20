// File: routes/questRoutes.js


const express = require('express');
const router = express.Router(); // Tạo router

// Import bộ não logic bạn vừa viết ở trên
const { getQuests, addQuest, updateQuest, deleteQuest } = require('../controllers/questController');
// Gắn đường dẫn mạng với hàm xử lý
// Lưu ý: Ta chỉ cần viết '/' vì lát nữa ở server.js ta sẽ nối nó với '/api/quests'
const authMiddleware = require('../middleware/authMiddleware');

// 2. Đặt Middleware chặn trước tất cả các tuyến đường cần bảo vệ
router.get('/', authMiddleware, getQuests);       // Phải có thẻ bài mới được xem nhiệm vụ
router.post('/', authMiddleware, addQuest);       // Phải có thẻ bài mới được nhận nhiệm vụ mới
router.put('/:id', authMiddleware, updateQuest);  // Phải có thẻ bài mới được đánh dấu hoàn thành
router.delete('/:id', authMiddleware, deleteQuest); // Phải có thẻ bài mới được xóa

module.exports = router; // Xuất biển báo giao thông ra