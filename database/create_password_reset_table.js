/**
 * One-off helper script to ensure the password_reset_requests table exists.
 * Run: node database/create_password_reset_table.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wastesense_db',
  multipleStatements: true
};

async function ensurePasswordResetTable() {
  let connection;
  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database:', dbConfig.database);

    const sql = `
      CREATE TABLE IF NOT EXISTS password_reset_requests (
        request_id    INT AUTO_INCREMENT PRIMARY KEY,
        user_id       INT DEFAULT NULL,
        email         VARCHAR(255) NOT NULL,
        request_type  ENUM('change_password') NOT NULL,
        description   TEXT NOT NULL,
        status        ENUM('pending','accepted','denied','completed') NOT NULL DEFAULT 'pending',
        created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        resolved_at   TIMESTAMP NULL DEFAULT NULL,

        INDEX idx_email_status (email, status),
        INDEX idx_status       (status),

        CONSTRAINT fk_prr_user
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;

    console.log('📋 Ensuring password_reset_requests table exists...');
    await connection.query(sql);
    console.log('✅ password_reset_requests table is ready.');
  } catch (error) {
    console.error('❌ Error creating password_reset_requests table:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

ensurePasswordResetTable();

