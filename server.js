const express = require('express');
const session = require('express-session');
const axios = require('axios');  // Asegúrate de importar axios
require('dotenv').config();  // Esto asegurará que puedas usar las variables de entorno
const handleChatRequest = require('./api/chat'); // Importar handleChatRequest

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON, manejar la subida de archivos y sesiones
app.use(express.json());
app.use(express.static('public'));  // Servir archivos estáticos desde 'public'
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

// Middleware para parsear texto plano
app.use(express.text());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Usa una clave secreta desde variables de entorno
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Secure true en producción
}));

app.use(express.json()); // Middleware para parsear JSON


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
        console.log("ChatGPT response:", chatResponse); // Log aquí solo si la respuesta es exitosa y está completamente procesada.
        res.json(chatResponse);
    } catch (error) {
        console.error('Error processing the ChatGPT request:', error);
        res.status(500).send('Error processing the ChatGPT request.');
    }
});

async function testChatApi() {
    try {
        const response = await axios.post('http://localhost:3000/api/chat', {
            message: "Hello, world!"
        });
        console.log('Response from /api/chat:', response.data);
    } catch (error) {
        console.error('Error testing /api/chat:', error);
    }
}

testChatApi();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
