const express = require('express');
const session = require('express-session');
const handleChatRequest = require('./api/chat');
const fileUpload = require('express-fileupload');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


// Middleware para parsear JSON, manejar la subida de archivos y sesiones
app.use(express.json());
app.use(express.static('public'));  // Servir archivos estáticos desde 'public'
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Usa una clave secreta desde variables de entorno
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Secure true en producción
}));

// Middleware para parsear texto plano
app.use(express.text());


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
            console.log('Category data stored in session:', req.session.categoryData); // Añadir registro para depurar
            res.send({ message: 'File uploaded and processed successfully.' });
        } catch (error) {
            console.error('Error reading or parsing the file:', error);
            res.status(500).send('Error parsing the JSON file.');
        }
    });
});

// Ruta para manejar las solicitudes de ChatGPT solo con el mensaje
app.post('/api/chat', async (req, res) => {
    const message = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
        console.log("Error: El mensaje está vacío.");
        return res.status(400).json({ error: 'El mensaje no puede estar vacío.' });
    }

    try {
        const chatResponse = await handleChatRequest(message);
        // Log aquí solo si la respuesta es exitosa y está completamente procesada.
        console.log("ChatGPT response:", chatResponse);
        res.json(chatResponse);
    } catch (error) {
        console.error('Error processing the ChatGPT request:', error);
        res.status(500).send('Error processing the ChatGPT request.');
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
