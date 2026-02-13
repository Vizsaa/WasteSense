/**
 * Fix Admin Password Script
 * This script will update the admin user's password hash
 * Run: node database/fix_admin_password.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wastesense_db'
};

async function fixAdminPassword() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL');
    
    const adminEmail = 'admin@wastesense.ph';
    const adminPassword = 'admin123';
    
    // Generate new password hash
    console.log('\n🔐 Generating password hash...');
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hash generated');
    
    // Check if admin user exists
    console.log('\n🔍 Checking if admin user exists...');
    const [users] = await connection.query(
      'SELECT user_id, email, role FROM users WHERE email = ?',
      [adminEmail]
    );
    
    if (users.length === 0) {
      console.log('⚠️  Admin user not found. Creating new admin user...');
      
      // Create admin user
      await connection.query(`
        INSERT INTO users (email, password_hash, full_name, role, phone_number, address, barangay_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        adminEmail,
        passwordHash,
        'System Administrator',
        'admin',
        '09123456789',
        'Admin Office',
        null
      ]);
      
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('✅ Admin user found');
      console.log(`   User ID: ${users[0].user_id}`);
      console.log(`   Email: ${users[0].email}`);
      console.log(`   Role: ${users[0].role}`);
      
      // Update password hash
      console.log('\n🔄 Updating password hash...');
      await connection.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [passwordHash, adminEmail]
      );
      console.log('✅ Password hash updated successfully!');
    }
    
    // Verify the password works
    console.log('\n🧪 Verifying password...');
    const [verifyUsers] = await connection.query(
      'SELECT password_hash FROM users WHERE email = ?',
      [adminEmail]
    );
    
    if (verifyUsers.length > 0) {
      const isValid = await bcrypt.compare(adminPassword, verifyUsers[0].password_hash);
      if (isValid) {
        console.log('✅ Password verification successful!');
      } else {
        console.log('❌ Password verification failed!');
      }
    }
    
    console.log('\n🎉 Admin password fix completed!');
    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure XAMPP MySQL service is running!');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database "wastesense_db" does not exist!');
      console.error('   Please run the database setup first.');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run fix
fixAdminPassword();
