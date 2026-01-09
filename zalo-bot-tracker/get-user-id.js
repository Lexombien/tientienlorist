import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3003;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

console.log('=================================');
console.log('🔍 HELPER: Lấy User ID từ Zalo');
console.log('=================================');
console.log('📝 Hướng dẫn:');
console.log('1. Server đang chạy và chờ webhook...');
console.log('2. Mở Zalo và nhắn tin CHO BOT của bạn');
console.log('3. User ID của bạn sẽ hiện ra bên dưới');
console.log('4. Copy User ID đó và điền vào file .env');
console.log('=================================\n');

app.post('/webhook', (req, res) => {
    try {
        // Verify secret token
        const secretToken = req.headers['x-bot-api-secret-token'];
        if (secretToken !== WEBHOOK_SECRET) {
            console.log('⚠️ Sai secret token');
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const body = req.body;

        if (body.ok && body.result && body.result.message) {
            const message = body.result.message;
            const userId = message.from.id;
            const displayName = message.from.display_name;

            console.log('\n✅ ĐÃ NHẬN ĐƯỢC TIN NHẮN!');
            console.log('=================================');
            console.log(`👤 Tên: ${displayName}`);
            console.log(`🆔 User ID: ${userId}`);
            console.log('=================================');
            console.log('\n📋 Copy User ID này vào file .env:');
            console.log(`OWNER_ZALO_ID=${userId}\n`);
        }

        res.json({ message: 'Success' });
    } catch (error) {
        console.error('❌ Lỗi:', error);
        res.status(500).json({ message: 'Error' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}/webhook`);
    console.log('⏳ Đang chờ bạn nhắn tin cho bot...\n');
});
