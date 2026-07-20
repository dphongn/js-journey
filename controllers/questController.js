const pool = require('../config/db'); // Import pool từ file db.js

// File: controllers/questController.js
// Hàm 1: Lấy danh sách
const getQuests = async (req, res) => {
    try {
        const userId = req.user.id; // Lấy từ authMiddleware
        // Dùng SQL: Chọn tất cả từ bảng quests, sắp xếp theo ID tăng dần
        const result = await pool.query('SELECT * FROM quests WHERE user_id = $1 ORDER BY id ASC', [userId]);
        res.json(result.rows); // result.rows chứa toàn bộ dữ liệu trả về từ DB
    } catch (error) {
        console.error("Lỗi lấy danh sách:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

// Hàm 2: Thêm nhiệm vụ
const addQuest = async (req, res) => {
    try {
        const { text } = req.body;
        
        // Dùng SQL: Chèn dữ liệu vào cột text. 
        // $1 là cơ chế bảo mật chống SQL Injection của thư viện 'pg'
        // RETURNING * nghĩa là chèn xong thì trả về ngay object vừa tạo
        const userId = req.user.id;
        const result = await pool.query(
            'INSERT INTO quests (text, user_id) VALUES ($1, $2) RETURNING *',
            [text, userId]
        );
        
        res.status(201).json(result.rows[0]); 
    } catch (error) {
        console.error("Lỗi thêm nhiệm vụ:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

// Làm tương tự cho updateQuest (PUT) và deleteQuest (DELETE)...

const updateQuest = async (req, res) => {
    try {
        const questId = Number(req.params.id);
        const userId = req.user.id;
        
        // Bước A: Tìm nhiệm vụ hiện tại trong database xem nó đang true hay false
        const findResult = await pool.query('SELECT * FROM quests WHERE id = $1 AND user_id = $2', [questId, userId]);
        
        if (findResult.rows.length === 0) {
            return res.status(404).json({ message: 'Nhiệm vụ không tồn tại!' });
        }
        
        const currentQuest = findResult.rows[0];
        const newStatus = !currentQuest.completed; // Đảo ngược trạng thái
        
        // Bước B: Chạy lệnh UPDATE
        // Bước B: Chạy lệnh UPDATE
        const updateResult = await pool.query(
            'UPDATE quests SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [newStatus, questId, userId]
        );
        
        res.json(updateResult.rows[0]);
    } catch (error) {
        console.error("Lỗi cập nhật nhiệm vụ:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

const deleteQuest = async (req, res) => {
    try { 
        const questId = Number(req.params.id);
        const userId = req.user.id;
        // Dùng SQL: Xóa nhiệm vụ có id tương ứng
        await pool.query('DELETE FROM quests WHERE id = $1 AND user_id = $2', [questId, userId]);
        
        res.json({ success: true, message: 'Nhiệm vụ đã được xóa khỏi database!' });
    } catch (error) {
        console.error("Lỗi xóa nhiệm vụ:", error);
        res.status(500).json({ message: "Lỗi máy chủ" });
    }
};

// Xuất các hàm này ra để file khác có thể dùng được
module.exports = {
    getQuests,
    addQuest,
    updateQuest,
    deleteQuest
};