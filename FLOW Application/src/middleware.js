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

    const ipWhitelist = ['193.111.135.8', '193.179.166.4', '89.250.246.145', '81.162.206.22', '46.135.36.35',
                    '185.61.84.169', '188.75.167.23', '178.72.203.62', '46.135.37.210', '31.30.154.11',
                    '213.220.214.110', '78.102.244.17', '109.81.85.35', '77.240.93.3', '176.222.225.42',
                    '196.245.220.117', '83.240.62.129', '216.193.109.150', '78.102.75.224', '149.40.61.226',
                    '216.173.109.166', '109.202.93.65', '195.113.184.88', '89.24.56.145', '78.80.19.22',
                    '178.72.203.61', '64.137.17.47', '216.173.103.220','64.137.66.232', '216.173.109.54',
                    '149.62.147.74', '46.125.18.100', '109.239.70.9', '90.183.23.226','2001:718:ff05:108::93', 
                    '2001:1528:123:123::cde2'];

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
