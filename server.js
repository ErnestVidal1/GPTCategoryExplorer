const express = require('express');
const axios = require('axios');  // Asegúrate de importar axios
require('dotenv').config();  // Esto asegurará que puedas usar las variables de entorno
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/api/hello', (req, res) => {
  res.send('Hello, World!');
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
