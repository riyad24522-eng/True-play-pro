const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// আপনার বট টোকেন (Render Environment Variable থেকে নেওয়া ভালো)
const BOT_TOKEN = process.env.BOT_TOKEN || '8206830214:AAHKtCZSZ9fpI7hN1PifvAuQiQkx90_-aOc';

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
app.post('/verify-membership', async (req, res) => {
    // ফ্রন্টএন্ড থেকে পাঠানো ডেটা (camelCase)
    const { userId, channelId } = req.body;

    // ভ্যালিডেশন
    if (!userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'userId is required' 
        });
    }
    if (!channelId) {
        return res.status(400).json({ 
            success: false, 
            error: 'channelId is required' 
        });
    }

    const chat_id = CHANNELS[channelId];
    if (!chat_id) {
        return res.status(400).json({ 
            success: false, 
            error: 'Invalid channelId. Use: channel_1, channel_2, or channel_3' 
        });
    }

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`;
        const response = await axios.post(url, {
            chat_id: chat_id,
            user_id: String(userId)
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
