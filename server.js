const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

// Configuración de CORS para permitir todas las solicitudes
app.use(cors());

// Servir archivos estáticos manualmente
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), {
    headers: {
      'Content-Type': 'text/html'
    }
  });
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'style.css'), {
    headers: {
      'Content-Type': 'text/css'
    }
  });
});

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'script.js'), {
    headers: {
      'Content-Type': 'application/javascript'
    }
  });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
