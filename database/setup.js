/**
 * Database Setup Script
 * This script helps set up the WasteSense database
 * Run: node database/setup.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
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

    // If tables already exist, drop them so the setup can be re-run safely
    // This keeps the script idempotent for local development.
    console.log('\n🧹 Resetting existing tables (if any)...');
    const [existingTables] = await connection.query('SHOW TABLES');
    const tableNames = (existingTables || []).map(t => Object.values(t)[0]).filter(Boolean);

    if (tableNames.length > 0) {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const table of tableNames) {
        await connection.query(`DROP TABLE IF EXISTS \`${table}\``);
      }
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
      console.log(`✅ Dropped ${tableNames.length} existing table(s)`);
    } else {
      console.log('✅ No existing tables found');
    }
    
    // Read and execute the consolidated SQL dump (project root)
    console.log('\n📋 Running wastesense_db.sql...');
    const sqlPath = path.join(__dirname, '..', 'wastesense_db.sql');
    const setupSQL = fs.readFileSync(sqlPath, 'utf8');
    
    // Remove DROP/CREATE DATABASE and USE statements (we already created & selected the DB above)
    const cleanSQL = setupSQL
      .replace(/DROP DATABASE.*?;/gi, '')
      .replace(/CREATE DATABASE.*?;/gi, '')
      .replace(/USE.*?;/gi, '');
    
    await connection.query(cleanSQL);
    console.log('✅ Tables created and seed data inserted');
    
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
