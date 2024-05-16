// Registration endpoint
app.post('/register', async (req, res) => {
    try {
        // Extract the plaintext password from the request body
        const plaintextPassword = req.body.password;
        // Hash the plaintext password using bcrypt
        const hashedPassword = await bcrypt.hash(plaintextPassword, 10); // Hash password with a salt factor of 10
        const username = req.body.username;
        const email = req.body.email;
       
        await storeUser(username, email, hashedPassword);
  
        // Send a success response
        res.status(200).send('User registered successfully');
    } catch (error) {
        // Handle errors
        console.error('Error registering user:', error);
        res.status(500).send('Internal server error');
    }
  });