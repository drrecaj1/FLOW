
const express = require('express');
const path = require('path');
const ipValidationMiddleware = require('./middleware'); // Import the middleware
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to use IP validation
app.use(ipValidationMiddleware);

// Endpoint to handle incoming requests
app.get('/', (req, res) => {
    res.send('Welcome!');
});


app.use(express.static(path.join(__dirname, '..', 'public')));



// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});