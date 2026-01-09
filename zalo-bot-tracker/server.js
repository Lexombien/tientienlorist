import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { saveClick, getTodayStats } from './database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Zalo Bot API configuration
const ZALO_API_BASE = 'https://bot-api.zaloplatforms.com/bot';
const BOT_TOKEN = process.env.BOT_TOKEN;
const OWNER_ZALO_ID = process.env.OWNER_ZALO_ID;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const SHOP_NAME = process.env.SHOP_NAME || 'Shop';
const ENABLE_DATABASE = process.env.ENABLE_DATABASE === 'true';

/**
 * Gửi tin nhắn qua Zalo Bot API
 */
async function sendZaloMessage(chatId, message) {
    try {
        const response = await axios.post(
            `${ZALO_API_BASE}${BOT_TOKEN}/sendMessage`,
            {
                chat_id: chatId,
                text: message
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error('❌ Lỗi khi gửi tin nhắn Zalo:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Format tin nhắn thông báo
 */
function formatNotificationMessage(data) {
    const time = new Date().toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        dateStyle: 'short',
        timeStyle: 'medium'
    });

    let message = `🔔 [${SHOP_NAME}] THÔNG BÁO CLICK\n\n`;
    message += `📦 Sản phẩm: ${data.productName}\n`;
    message += `🔗 Link: ${data.productUrl}\n`;
    message += `⏰ Thời gian: ${time}\n`;

    if (data.productId) {
        message += `🆔 ID: ${data.productId}\n`;
    }

    if (data.userIp) {
        message += `🌐 IP: ${data.userIp}\n`;
    }

    return message;
}

// ============================================
// WEBHOOK ENDPOINT - Nhận events từ Zalo
// ============================================
app.post('/webhook', async (req, res) => {
    try {
        // Verify secret token
        const secretToken = req.headers['x-bot-api-secret-token'];
        if (secretToken !== WEBHOOK_SECRET) {
            console.log('⚠️ Webhook bị từ chối - Sai secret token');
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const body = req.body;
        console.log('📨 Nhận webhook:', JSON.stringify(body, null, 2));

        // Xử lý webhook tại đây (nếu cần)
        // VD: Tự động trả lời tin nhắn của khách

        res.json({ message: 'Success' });
    } catch (error) {
        console.error('❌ Lỗi xử lý webhook:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ============================================
// TRACKING ENDPOINT - Nhận click từ website
// ============================================
app.post('/api/track-click', async (req, res) => {
    try {
        const { productName, productUrl, productId } = req.body;

        // Validate input
        if (!productName || !productUrl) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: productName, productUrl'
            });
        }

        // Lấy thông tin người dùng
        const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const referrer = req.headers['referer'];

        const clickData = {
            productName,
            productUrl,
            productId,
            userIp,
            userAgent,
            referrer
        };

        // Lưu vào database (nếu bật)
        if (ENABLE_DATABASE) {
            try {
                saveClick(clickData);
                console.log('💾 Đã lưu vào database');
            } catch (dbError) {
                console.error('⚠️ Lỗi lưu database:', dbError);
                // Không fail request nếu lỗi database
            }
        }

        // Gửi thông báo đến chủ shop qua Zalo
        if (OWNER_ZALO_ID && BOT_TOKEN) {
            try {
                const message = formatNotificationMessage(clickData);
                await sendZaloMessage(OWNER_ZALO_ID, message);
                console.log('✅ Đã gửi thông báo Zalo đến chủ shop');
            } catch (zaloError) {
                console.error('⚠️ Lỗi gửi Zalo:', zaloError);
                // Không fail request nếu lỗi gửi Zalo
            }
        }

        res.json({
            success: true,
            message: 'Click tracked successfully'
        });

    } catch (error) {
        console.error('❌ Lỗi track click:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
});

// ============================================
// STATS ENDPOINT - Xem thống kê (tùy chọn)
// ============================================
app.get('/api/stats', (req, res) => {
    try {
        if (!ENABLE_DATABASE) {
            return res.json({ message: 'Database disabled' });
        }

        const todayStats = getTodayStats();

        res.json({
            today: todayStats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Lỗi lấy stats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        config: {
            botConfigured: !!BOT_TOKEN,
            ownerConfigured: !!OWNER_ZALO_ID,
            databaseEnabled: ENABLE_DATABASE
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log('=================================');
    console.log('🚀 Zalo Bot Tracker Server Started');
    console.log('=================================');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🤖 Bot Token: ${BOT_TOKEN ? '✅ Configured' : '❌ Missing'}`);
    console.log(`👤 Owner ID: ${OWNER_ZALO_ID ? '✅ Configured' : '❌ Missing'}`);
    console.log(`💾 Database: ${ENABLE_DATABASE ? '✅ Enabled' : '❌ Disabled'}`);
    console.log('=================================');

    if (!BOT_TOKEN || !OWNER_ZALO_ID) {
        console.log('\n⚠️  CẢNH BÁO: Vui lòng cấu hình file .env');
        console.log('   Xem file .env.example để biết thêm chi tiết');
    }
});
