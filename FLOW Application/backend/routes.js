//Define routes

//Welcome page 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

//Registration page 
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

//Login page
app.get('/login', (req, res) =>{
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

//Profile page
app.get('/profile', (req, res) =>{
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

//Product page
app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});