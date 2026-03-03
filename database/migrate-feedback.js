const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

async function run() {
  let connection;
  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);

    const dbName = process.env.DB_NAME || 'wastesense_db';
    await connection.query(`USE ${dbName}`);

    console.log('🛠️  Creating feedback table if missing...');

    const sql = `
      CREATE TABLE IF NOT EXISTS feedback (
        feedback_id   INT AUTO_INCREMENT PRIMARY KEY,
        user_id       INT NOT NULL,
        message       TEXT NOT NULL,
        created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        INDEX idx_feedback_user (user_id),
        INDEX idx_feedback_created (created_at),

        CONSTRAINT fk_feedback_user
          FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;

    await connection.query(sql);

    const [tables] = await connection.query("SHOW TABLES LIKE 'feedback'");
    if (tables.length === 0) {
      throw new Error('Migration failed: feedback table not found after CREATE TABLE');
    }

    console.log('✅ Migration complete: feedback table is present');
  } finally {
    if (connection) await connection.end();
  }
}

run().catch((err) => {
  console.error('❌ Migration error:', err.message);
  process.exit(1);
});
