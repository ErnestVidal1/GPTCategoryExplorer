const express = require('express');
const session = require('express-session');
const handleChatRequest = require('./api/chat');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const CircularJSON = require('circular-json'); // Añadir la biblioteca circular-json
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Verificar si las variables de entorno se cargaron correctamente
if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY no está definida en las variables de entorno.");
}

app.use(express.json());
app.use(express.static('public'));  // Servir archivos estáticos desde 'public'
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

// Middleware para parsear texto plano
app.use(express.text());

app.post('/upload-json', (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).json({ error: 'No file was uploaded.' });  // Devolver JSON en caso de error
    }

    const jsonFile = req.files.file;
    const tempPath = `/tmp/${jsonFile.name}`;

    jsonFile.mv(tempPath, async (err) => {
        if (err) {
            console.error('Error moving the file:', err);
            return res.status(500).json({ error: 'Error processing file.' });  // Devolver JSON en caso de error
        }

        try {
            const data = fs.readFileSync(tempPath, 'utf8');
            req.session.categoryData = JSON.parse(data);
            console.log('Category data stored in session:', req.session.categoryData);
            res.json({ message: 'File uploaded and processed successfully.' });
        } catch (error) {
            console.error('Error reading or parsing the file:', error);
            res.status(500).json({ error: 'Error parsing the JSON file.' });  // Devolver JSON en caso de error
        }
    });
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;  // Extrae el mensaje del cuerpo de la solicitud

    if (!message || typeof message !== 'string' || message.trim() === '') {
        console.log("Error: El mensaje está vacío.");
        return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    try {
        console.log("Sending message to ChatGPT:", message);
        const chatResponse = await handleChatRequest(message);
        console.log("ChatGPT response:", chatResponse);
        res.json(chatResponse);
    } catch (error) {
        console.error('Error processing the ChatGPT request:', CircularJSON.stringify(error)); // Usar CircularJSON para evitar el error de estructura circular
        if (error.response) {
            console.error("Response data:", CircularJSON.stringify(error.response.data));
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
        } else if (error.request) {
            console.error("No response received from ChatGPT:", error.request);
        } else {
            console.error("Error setting up the request:", error.message);
        }
        res.status(500).json({ error: 'Error processing the ChatGPT request.' });  // Devolver JSON en caso de error
    }
});

app.get('/check-file-uploaded', (req, res) => {
    if (req.session.categoryData) {
        res.json({ uploaded: true });
    } else {
        res.json({ uploaded: false });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
