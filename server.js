const express = require('express');
const session = require('express-session');
const axios = require('axios');  // Asegúrate de importar axios
require('dotenv').config();  // Esto asegurará que puedas usar las variables de entorno
const app = express();
const PORT = process.env.PORT || 3000;

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Usa una clave secreta desde variables de entorno
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' } // Secure true en producción
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
