const axios = require('axios');
require('dotenv').config(); // Asegúrate de que las variables de entorno estén cargadas

// En ./api/chat
async function handleChatRequest(message) {
    console.log("Sending message to ChatGPT:", message);  // Añade este log para rastrear lo que envías.
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-4",
            messages: [{ role: "user", content: message }]
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error al procesar la solicitud de ChatGPT:", error);
        throw error;
    }
}


module.exports = handleChatRequest;
