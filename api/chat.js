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

        // Registro adicional para la respuesta completa
        console.log("Response from ChatGPT:", response.data);

        return response.data;
    } catch (error) {
        // Log detallado del error
        if (error.response) {
            console.error("Error al procesar la solicitud de ChatGPT:", error.response.data);
            console.error("Status:", error.response.status);
            console.error("Headers:", error.response.headers);
        } else if (error.request) {
            console.error("No response received from ChatGPT:", error.request);
        } else {
            console.error("Error setting up the request:", error.message);
        }
        throw error;  // Re-lanza el error para que sea manejado más arriba
    }
}

module.exports = handleChatRequest;
