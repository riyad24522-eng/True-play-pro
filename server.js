const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// আপনার বট টোকেন
const BOT_TOKEN = '8206830214:AAHKtCZSZ9fpI7hN1PifvAuQiQkx90_-aOc';

// চ্যানেল লিস্ট
const CHANNELS = {
    'channel_1': '@trueplaychannel1',
    'channel_2': '@trueplaychannel2',
    'channel_3': '@trueplaychannel3'
};

// হেলথ চেক
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        message: 'True-Play API is running!',
        channels: Object.keys(CHANNELS)
    });
});

// ভেরিফিকেশন এন্ডপয়েন্ট
app.post('/verify_membership', async (req, res) => {
    const { user_id, channel_id } = req.body;

    // ভ্যালিডেশন
    if (!user_id) {
        return res.status(400).json({ 
            success: false, 
            error: 'user_id is required' 
        });
    }
    if (!channel_id) {
        return res.status(400).json({ 
            success: false, 
            error: 'channel_id is required' 
        });
    }

    const chat_id = CHANNELS[channel_id];
    if (!chat_id) {
        return res.status(400).json({ 
            success: false, 
            error: 'Invalid channel_id. Use: channel_1, channel_2, or channel_3' 
        });
    }

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`;
        const response = await axios.post(url, {
            chat_id: chat_id,
            user_id: String(user_id)
        });

        const result = response.data.result;
        const status = result.status;
        const isMember = (status === 'member' || status === 'administrator' || status === 'creator');

        res.json({
            success: true,
            isMember: isMember,
            status: status,
            user: {
                username: result.user?.username || null,
                is_admin: (status === 'administrator' || status === 'creator')
            }
        });

    } catch (error) {
        console.error('Telegram API Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.description || 'Internal server error'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
