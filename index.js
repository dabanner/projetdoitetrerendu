const express = require('express');
const path = require('path');

const cors = require('cors');
const app = express();
const PORT = 3000;

const corsOptions = {
    origin: 'https://www.nileshblog.tech/',//(https://your-client-app.com)
    optionsSuccessStatus: 200,
  };
 
app.use(cors(corsOptions));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/tidy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tidy_tree','tidy_tree.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

