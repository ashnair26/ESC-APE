const bcrypt = require('bcryptjs');

// The password hash from the database
const storedHash = '$2b$10$J.9kb4e9g6sG5GGgbx/5xeMk4gs.8fIUP8dxBCB1y7.XLhg/S0T2i';

// The password from the login form
const password = 'admin123';

// Verify the password
bcrypt.compare(password, storedHash)
  .then(match => {
    console.log('Password match:', match);
  })
  .catch(err => {
    console.error('Error:', err);
  });
