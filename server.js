const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); // এখানে .env ফাইল থেকে ডেটা লোড হচ্ছে

const app = express();
app.use(cors());
app.use(express.json());

// .env ফাইল থেকে টোকেন নিচ্ছি (সিকিউর)
const BOT_TOKEN = process.env.BOT_TOKEN; 

const CHANNELS = {
    'channel_1': '@trueplaychannel1',
    'channel_2': '@trueplaychannel2',
    'channel_3': '@trueplaychannel3'
};

app.post('/verify-membership', async (req, res) => {
    const { userId, channelId } = req.body;

    if (!userId || !channelId) {
        return res.status(400).json({ success: false, error: 'Missing userId or channelId' });
    }

    const chatId = CHANNELS[channelId];
    if (!chatId) {
        return res.status(400).json({ success: false, error: 'Invalid channel ID' });
    }

    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember`;
        const response = await axios.post(url, {
            chat_id: chatId,
            user_id: String(userId) // String হিসেবে পাঠানো নিরাপদ
        });

        const status = response.data.result.status;
        const isMember = ['member', 'administrator', 'creator'].includes(status);
        
        res.json({ success: true, isMember, status });
    } catch (error) {
        console.error('Telegram API Error:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            error: error.response?.data?.description || 'Failed to verify membership'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
