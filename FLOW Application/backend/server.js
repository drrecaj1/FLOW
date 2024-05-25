const express = require('express');
const path = require('path');
const { checkIp } = require("./ipcheck");
const bodyParser = require('body-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { DAO } = require("../dao/DAO");
const{ Pool } = require('pg')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
// const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;



app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    next();
});


// PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: '0000',
    port: 5432,
});

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

app.get('/account', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'accountpage.html'));
});


// Endpoint to handle registration and email verification
app.post('/api/register', async (req, res) => {
    const { email, password, full_name } = req.body;



    console.log('Received registration data:', req.body); // This will help you see what data is received

    const userCheckResult = await pool.query(
        'SELECT user_id FROM USERS WHERE email = $1',
        [email]
    );
    
    if (userCheckResult.rows.length > 0) {
        return res.status(400).json({ message: 'Email is already registered. Please log in.' });
    }
    
    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Set token expiration time (24 hours from now)
    const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
        // Hash the password before storing it
        const hashedPassword = await bcrypt.hash(password, 10); 

        // Save user to the database
        const userResult = await pool.query(
            `INSERT INTO USERS (email, password_hash, full_name, status, is_verified)
            VALUES ($1, $2, $3, 'on hold', FALSE)
            RETURNING user_id`,
            [email, hashedPassword, full_name]
        );

        const userId = userResult.rows[0].user_id;

        // Save the verification token to the TWO_FACTOR_AUTHENTICATION table
        await pool.query(
            `INSERT INTO TWO_FACTOR_AUTHENTICATION (user_id, auth_code_hash, timestamp, status)
            VALUES ($1, $2, $3, 'sent')`,
            [userId, verificationToken, verificationTokenExpiresAt]
        );

        // Send verification email
        await sendVerificationEmail(email, verificationToken);

        // Respond to the client
        res.json({ message: 'User registered successfully. Check your email for verification instructions.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Endpoint to handle email verification
app.get('/verify/:token', async (req, res) => {
    const token = req.params.token;

    try {
        // Find the user by the verification token in your database
        const result = await pool.query(
            `SELECT u.user_id, u.is_verified, t.timestamp AS token_expiration
             FROM USERS u
             JOIN TWO_FACTOR_AUTHENTICATION t ON u.user_id = t.user_id
             WHERE t.auth_code_hash = $1 AND t.status = 'sent'`,
            [token]
        );

        const user = result.rows[0];

        // If user not found or token is expired, handle accordingly
        if (!user || user.token_expiration < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        // Update user's verification status to true and update token status
        await pool.query(
            `UPDATE USERS SET is_verified = TRUE, status = 'verified' WHERE user_id = $1`,
            [user.user_id]
        );
        await pool.query(
            `UPDATE TWO_FACTOR_AUTHENTICATION SET status = 'verified' WHERE auth_code_hash = $1`,
            [token]
        );

        // Redirect to the index page with a query parameter indicating success
        return res.redirect(`/index.html?verified=true`);
    } catch (error) {
        console.error('Error verifying email:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

// Function to generate a verification token
function generateVerificationToken() {
    return crypto.randomBytes(16).toString('hex');
}

// Function to send verification email
async function sendVerificationEmail(email, token) {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'asarekenny59@gmail.com',
            pass: 'iutynnhnhofubisy',
        },
    });

    const verificationLink = `http://localhost:${PORT}/verify/${token}`;

    try {
        let info = await transporter.sendMail({
            from: '"Flow Application" <flowbankapplication@gmail.com>',
            to: email,
            subject: 'Email Verification',
            text: `Click the following link to verify your email: ${verificationLink}`,
        });
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}



app.get('/api/user/:user_id', async (req, res) => {
    const userId = req.params.user_id;

    try {
        const userResult = await pool.query(
            'SELECT email, full_name FROM USERS WHERE user_id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];
        res.json({ email: user.email, full_name: user.full_name });
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query(
            'SELECT user_id, password_hash FROM USERS WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.json({ user_id: user.user_id });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
