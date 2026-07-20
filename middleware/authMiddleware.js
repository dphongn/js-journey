// Nạp công cụ kiểm tra Thẻ bài (JWT)
const jwt = require('jsonwebtoken');

// Tạo hàm middleware (Người gác cổng)
// Khác với Controller chỉ có (req, res), Middleware luôn có thêm tham số 'next'
const authMiddleware = (req, res, next) => {
    // Bước 1: Yêu cầu khách trình Thẻ bài. 
    // Trong chuẩn API, thẻ bài thường được giấu trong Header có tên là 'Authorization'
    const authHeader = req.header('Authorization');

    // Bước 2: Kiểm tra xem khách có đưa thẻ không, và thẻ có đúng định dạng không?
    // Định dạng chuẩn thường là: "Bearer [chuỗi_token_loằng_ngoằng]"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Nếu không có thẻ hoặc đưa sai định dạng -> Đuổi về ngay (Lỗi 401: Không được phép)
        return res.status(401).json({ message: 'Từ chối truy cập! Không tìm thấy Thẻ bài.' });
    }

    // Bước 3: Tách lấy phần Token thật sự (Cắt bỏ chữ "Bearer " ở đằng trước)
    // Ví dụ: "Bearer eyJhbGci..." -> Lấy phần "eyJhbGci..."
    const token = authHeader.split(' ')[1];

    try {
        // Bước 4: Đem Thẻ bài đi soi dưới "tia X" (Dùng chữ ký bí mật JWT_SECRET trong file .env)
        // Hàm jwt.verify sẽ tự động kiểm tra xem thẻ này có phải do chính Server mình cấp không, và thẻ có bị hết hạn chưa.
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Bước 5: Nếu thẻ là ĐỒ THẬT -> Lấy thông tin Hiệp sĩ (id) giấu trong thẻ, gắn nó vào túi đồ 'req'
        // Việc gắn vào req.user giúp cho các hàm ở Controller phía sau biết được ai đang gửi yêu cầu
        req.user = decoded;

        // Bước 6: Quan trọng nhất! Mở cổng cho khách đi tiếp vào bên trong (chuyển tới Controller).
        next(); 
    } catch (error) {
        // Nếu jwt.verify phát hiện thẻ giả (bị sửa đổi) hoặc thẻ đã hết hạn, nó sẽ nhảy xuống đây.
        // Lỗi 403: Cấm truy cập
        res.status(403).json({ message: 'Thẻ bài không hợp lệ hoặc đã hết hạn!' });
    }
};

// Xuất hàm này ra để các file khác có thể thuê "người gác cổng" này
module.exports = authMiddleware;