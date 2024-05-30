const express = require('express');
const session = require('express-session');
const axios = require('axios');
const fileUpload = require('express-fileupload');
const fs = require('fs');
require('dotenv').config();
const handleChatRequest = require('./api/chat');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para manejar sesiones
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Middleware para parsear JSON, manejar la subida de archivos y servir archivos estáticos
app.use(express.json());
app.use(express.static('public'));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Ruta para servir el archivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Ruta para probar OpenAI
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

// Ruta para manejar las solicitudes de ChatGPT solo con el mensaje
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
        console.log("Error: El mensaje está vacío.");
        return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    try {
        const chatResponse = await handleChatRequest(message);
        console.log("ChatGPT response:", chatResponse);
        res.json(chatResponse);
    } catch (error) {
        console.error('Error processing the ChatGPT request:', error);
        res.status(500).send('Error processing the ChatGPT request.');
    }
});

// Ruta para subir archivos JSON
app.post('/upload-json', (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No file was uploaded.');
    }

    const jsonFile = req.files.file;
    jsonFile.mv(`/tmp/${jsonFile.name}`, async (err) => {
        if (err) {
            console.error('Error moving the file:', err);
            return res.status(500).send('Error processing file.');
        }

        try {
            const data = fs.readFileSync(`/tmp/${jsonFile.name}`, 'utf8');
            req.session.categoryData = JSON.parse(data);  // Store the JSON data in session
            console.log('Category data stored in session:', req.session.categoryData);
            res.send({ message: 'File uploaded and processed successfully.' });
        } catch (error) {
            console.error('Error reading or parsing the file:', error);
            res.status(500).send('Error parsing the JSON file.');
        }
    });
});

// Ruta para verificar si el archivo ha sido subido
app.get('/check-file-uploaded', (req, res) => {
    if (req.session.categoryData) {
        res.json({ uploaded: true });
    } else {
        res.json({ uploaded: false });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
