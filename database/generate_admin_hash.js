// Utility script to generate bcrypt hash for admin password
// Run: node database/generate_admin_hash.js

const bcrypt = require('bcrypt');

const password = 'admin123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    return;
  }
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nUse this hash in sample_data.sql for admin user');
});
