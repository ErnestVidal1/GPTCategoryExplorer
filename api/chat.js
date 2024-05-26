const axios = require('axios');
require('dotenv').config();

module.exports = async (req, res) => {
    if (req.method === 'POST') {
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
            console.error("Error al procesar la solicitud de ChatGPT:", error);
            res.status(500).send('Error processing the ChatGPT request.');
        }
    } else {
        res.status(405).send('Method Not Allowed');
    }
};
