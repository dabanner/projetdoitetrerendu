const express = require('express');
const path = require('path');
const fetch = require('node-fetch'); // This will now work with node-fetch@2

const app = express();
const PORT = 8080;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to fetch data from the external API
app.get('/api/data', async (req, res) => {
    const apiUrl = 'https://wasabi.i3s.unice.fr/api/v1/song/lyrics/language/popularity'; // Replace with actual URL

    try {
        // Fetch data from the external API
        const response = await fetch(apiUrl);
        const data = await response.json(); // Parse the response as JSON

        res.json(data); // Send the data to the client
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data from external API.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
