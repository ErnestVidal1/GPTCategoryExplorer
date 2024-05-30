const express = require('express');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.get('/test-openai', async (req, res) => {
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: [{ role: "user", content: "Hello, world!" }]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });
        res.json({ success: true, response: response.data });
    } catch (error) {
        console.error("Failed to reach OpenAI:", error);
        res.status(500).json({ success: false, error: error.toString() });
    }
});

app.post('/api/chat', async (req, res) => {
    const message = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
        console.log("Error: El mensaje está vacío.");
        return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    try {
        const chatResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: [{ role: "user", content: message }]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });
        console.log("ChatGPT response:", chatResponse.data);
        res.json(chatResponse.data);
    } catch (error) {
        console.error('Error processing the ChatGPT request:', error);
        res.status(500).send('Error processing the ChatGPT request.');
    }
});

// Otros endpoints de tu API

// Servir el archivo index.html para cualquier otra ruta
app.get('*', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
