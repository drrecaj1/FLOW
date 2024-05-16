const express = require('express');
const path = require('path');
const { checkIp } = require("./ipcheck");
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware to use IP validation
app.use(checkIp);

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Endpoint to handle incoming requests
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Endpoint to serve the register.html file
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'register.html'));
});

// Endpoint to handle registration
app.post('/api/register', (req, res) => {
    const userData = req.body;
    // Handle registration logic here (e.g., save user to database)
    console.log(userData);
    res.json({ message: 'User registered successfully' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
