const express = require('express');
const requestIp = require('request-ip');
const geoip = require('geoip-lite');

const app = express();

// Middleware to extract client's IP address
app.use(requestIp.mw());


// Endpoint to handle incoming requests
app.get('/', (req, res) => {
    // Get client's IP address
    const clientIp = req.clientIp;

    // Check if IP is in whitelist
    if (ipWhitelist.includes(clientIp)) {
        // Use geoip-lite to get country information
        const geo = geoip.lookup(clientIp);

        // Check if country is Czech Republic
        if (geo && geo.country === 'CZ') {
            // Allow access
            res.send('Welcome!');
        } else {
            // Block access for non-Czech Republic IPs
            res.status(403).send('Access denied');
        }
    } else {
        // Block access for IPs not in the whitelist
        res.status(403).send('Access denied');
    }
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
