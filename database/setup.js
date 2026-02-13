/**
 * Database Setup Script
 * This script helps set up the WasteSense database
 * Run: node database/setup.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true // Allow multiple SQL statements
};

async function setupDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL');
    
    const dbName = process.env.DB_NAME || 'wastesense_db';
    
    // Create database
    console.log(`\n📦 Creating database: ${dbName}...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci`);
    console.log(`✅ Database "${dbName}" created or already exists`);
    
    // Use the database
    await connection.query(`USE ${dbName}`);
    
    // Read and execute schema.sql
    console.log('\n📋 Creating tables...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove CREATE DATABASE and USE statements if present
    const cleanSchema = schemaSQL
      .replace(/CREATE DATABASE.*?;/gi, '')
      .replace(/USE.*?;/gi, '');
    
    await connection.query(cleanSchema);
    console.log('✅ Tables created successfully');
    
    // Insert sample locations
    console.log('\n📊 Inserting sample data...');
    await connection.query(`
      INSERT IGNORE INTO locations (barangay_name, municipality, province, zone_or_street) VALUES
      ('Barangay Poblacion', 'Sample Municipality', 'Sample Province', 'Zone 1'),
      ('Barangay San Jose', 'Sample Municipality', 'Sample Province', 'Zone 2'),
      ('Barangay Santa Maria', 'Sample Municipality', 'Sample Province', 'Zone 3')
    `);
    console.log('✅ Sample locations inserted');
    
    // Generate admin password hash and insert admin user
    const adminPassword = 'admin123';
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    
    await connection.query(`
      INSERT IGNORE INTO users (email, password_hash, full_name, role, phone_number, address, barangay_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'admin@wastesense.ph',
      adminPasswordHash,
      'System Administrator',
      'admin',
      '09123456789',
      'Admin Office',
      null
    ]);
    console.log('✅ Admin user created');
    
    // Get location IDs for schedules
    const [locationRows] = await connection.query('SELECT location_id FROM locations ORDER BY location_id LIMIT 3');
    const loc1 = locationRows[0]?.location_id || 1;
    const loc2 = locationRows[1]?.location_id || 2;
    const loc3 = locationRows[2]?.location_id || 3;
    
    // Get admin user ID
    const [adminUsers] = await connection.query('SELECT user_id FROM users WHERE role = "admin" LIMIT 1');
    const adminId = adminUsers[0]?.user_id || 1;
    
    // Insert sample schedules
    await connection.query(`
      INSERT IGNORE INTO schedules (location_id, collection_day, collection_time, waste_type, created_by) VALUES
      (?, 'Monday', '08:00:00', 'biodegradable', ?),
      (?, 'Wednesday', '08:00:00', 'non-biodegradable', ?),
      (?, 'Friday', '08:00:00', 'recyclable', ?),
      (?, 'Tuesday', '09:00:00', 'biodegradable', ?),
      (?, 'Thursday', '09:00:00', 'non-biodegradable', ?),
      (?, 'Monday', '10:00:00', 'mixed', ?),
      (?, 'Thursday', '10:00:00', 'mixed', ?)
    `, [loc1, adminId, loc1, adminId, loc1, adminId, loc2, adminId, loc2, adminId, loc3, adminId, loc3, adminId]);
    console.log('✅ Sample schedules inserted');
    
    // Verify setup
    console.log('\n🔍 Verifying setup...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:`, tables.map(t => Object.values(t)[0]).join(', '));
    
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log(`✅ Users table has ${users[0].count} record(s)`);
    
    const [locationCount] = await connection.query('SELECT COUNT(*) as count FROM locations');
    console.log(`✅ Locations table has ${locationCount[0].count} record(s)`);
    
    const [schedules] = await connection.query('SELECT COUNT(*) as count FROM schedules');
    console.log(`✅ Schedules table has ${schedules[0].count} record(s)`);
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📝 Default admin credentials:');
    console.log('   Email: admin@wastesense.ph');
    console.log('   Password: admin123');
    console.log('\n💡 You can now start the server with: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure XAMPP MySQL service is running!');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run setup
setupDatabase();
