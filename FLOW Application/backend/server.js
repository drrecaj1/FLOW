const express = require('express');
const path = require('path');
const {validateIP } = require(' ./middleware'); //validating IP

// create express application
const app = express();

//Define port
const PORT = process.env.PORT || 3000;

// static files
app.use(express.static(path.join(__dirname, 'public')));

//start server 
app.listen(PORT, () =>{
  console.log('Server is running on port ${PORT}');

});
