const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wastesense_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test connection
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connection established');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please ensure:');
    console.error('1. XAMPP MySQL service is running');
    console.error('2. Database "wastesense_db" exists');
    console.error('3. Database credentials in .env are correct');
  });

// Helper function to execute queries
const query = async (sql, params) => {
  try {
    const [rows, fields] = await pool.execute(sql, params);
    return [rows];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Helper function to execute queries and return full result (for INSERT queries that need insertId)
const execute = async (sql, params) => {
  try {
    const [result] = await pool.execute(sql, params);
    // For INSERT queries, result.insertId is available
    return result;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  execute
};
