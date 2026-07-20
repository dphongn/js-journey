const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('❌ Lỗi kết nối PostgreSQL rồi! Hãy kiểm tra lại mật khẩu hoặc file .env:', err.message);
    } else {
        console.log('✅ Kết nối PostgreSQL thành công! Thời gian hệ thống DB:', res.rows[0].now);
    }
});

module.exports = pool;