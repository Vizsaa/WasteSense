const db = require('../backend/config/db.config');

(async () => {
  try {
    console.log('🔌 Connecting to database (via db.config)...');

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS waste_categories (
        category_id    INT AUTO_INCREMENT PRIMARY KEY,
        category_key   VARCHAR(50)  NOT NULL,
        display_name   VARCHAR(100) NOT NULL,
        description    TEXT         DEFAULT NULL,
        is_active      TINYINT(1)   NOT NULL DEFAULT 1,
        created_by     INT          DEFAULT NULL,
        created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_category_key (category_key),
        INDEX idx_active           (is_active),
        CONSTRAINT fk_category_creator
          FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `;

    console.log('📋 Creating table IF NOT EXISTS: waste_categories...');
    await db.query(createTableSQL);
    console.log('✅ Table waste_categories is ready.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating waste_categories table:', error);
    process.exit(1);
  }
})();

