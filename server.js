const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware para servir archivos estáticos desde 'public'
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
