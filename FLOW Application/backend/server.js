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
const moment = require('moment-timezone');

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

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'forgotpassword.html'));
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
            console.error(`Login failed. Email not found: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            console.error(`Login failed. Password mismatch for email: ${email}`);
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        console.log(`Login successful for user_id: ${user.user_id}`);
        res.json({ user_id: user.user_id });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




// Endpoint to handle forgot-password
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const userResult = await pool.query(
            'SELECT user_id FROM USERS WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            console.error('Email not found:', email);
            return res.status(400).json({ message: 'Email not found' });
        }

        const user = userResult.rows[0];
        console.log(`Retrieved user: ${JSON.stringify(user)}`);

        const token = crypto.randomBytes(20).toString('hex');

        // Set token expiration time (1 hour from now) in local time (CEST)
        const tokenExpiresAt = moment().tz('Europe/Prague').add(1, 'hour').format('YYYY-MM-DD HH:mm:ss');
        console.log(`Generated token: ${token}`);
        console.log(`Token expires at (local time): ${tokenExpiresAt}`);

        const updateQuery = `
            UPDATE USERS 
            SET password_reset_token = $1, password_reset_token_expires = $2 
            WHERE user_id = $3 
            RETURNING password_reset_token, password_reset_token_expires`;
        const updateValues = [token, tokenExpiresAt, user.user_id];

        console.log(`Executing query: ${updateQuery} with values ${JSON.stringify(updateValues)}`);

        const updateResult = await pool.query(updateQuery, updateValues);

        console.log(`Update result: ${JSON.stringify(updateResult.rows)}`);

        if (updateResult.rowCount === 0) {
            console.error('Failed to update the user with reset token');
            return res.status(500).json({ message: 'Failed to update the user with reset token' });
        }

        const resetLink = `http://localhost:${PORT}/reset-password?token=${token}`;

        // Send email with the reset link
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: 'asarekenny59@gmail.com',
                pass: 'iutynnhnhofubisy',
            },
        });

        let info = await transporter.sendMail({
            from: '"Flow Application" <flowbankapplication@gmail.com>',
            to: email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password: ${resetLink}`,
        });

        console.log('Password reset email sent:', info.messageId);
        res.json({ message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error handling forgot password:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to handle reset-password
app.post('/api/reset-password', async (req, res) => {
    const { token, password } = req.body;
  
    try {
      const tokenResult = await pool.query(
        'SELECT user_id, password_reset_token_expires FROM USERS WHERE password_reset_token = $1',
        [token]
      );
  
      if (tokenResult.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }
  
      const tokenData = tokenResult.rows[0];
      const tokenExpiresAt = moment.tz(tokenData.password_reset_token_expires, 'Europe/Prague').format('YYYY-MM-DD HH:mm:ss');
      const currentTime = moment().tz('Europe/Prague').format('YYYY-MM-DD HH:mm:ss');
  
      console.log(`Token expiration time from DB (local time): ${tokenExpiresAt}`);
      console.log(`Current time (local time): ${currentTime}`);
  
      if (moment(currentTime).isAfter(tokenExpiresAt)) {
        return res.status(400).json({ message: 'Token has expired' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const updateQuery = `
        UPDATE USERS 
        SET password_hash = $1, password_reset_token = NULL, password_reset_token_expires = NULL 
        WHERE user_id = $2 
        RETURNING password_hash, password_reset_token, password_reset_token_expires`;
      const updateValues = [hashedPassword, tokenData.user_id];
  
      console.log(`Executing query: ${updateQuery} with values ${JSON.stringify(updateValues)}`);
  
      const updateResult = await pool.query(updateQuery, updateValues);
  
      console.log(`Password reset update result: ${JSON.stringify(updateResult.rows)}`);
  
      if (updateResult.rowCount === 0) {
        console.error('Failed to update the user password');
        return res.status(500).json({ message: 'Failed to update the user password' });
      }
  
      res.json({
        message: 'Password has been reset successfully. Please continue to <a href="/index.html">log in</a>.',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  


// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
