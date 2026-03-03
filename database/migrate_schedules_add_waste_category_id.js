const db = require('../backend/config/db.config');

(async () => {
  try {
    console.log('🔌 Connecting to database (via db.config)...');

    // 1) Check if schedules table already has waste_category_id
    const [cols] = await db.query(
      "SHOW COLUMNS FROM schedules LIKE 'waste_category_id'"
    );

    if (cols.length > 0) {
      console.log('ℹ️ Column waste_category_id already exists on schedules. Nothing to migrate.');
      process.exit(0);
    }

    // 2) Ensure standard waste categories exist
    console.log('📋 Ensuring standard waste categories exist...');
    const seedCategories = [
      ['biodegradable', 'Biodegradable', 'Organic / compostable waste'],
      ['non-biodegradable', 'Non-Biodegradable', 'Residual waste that is not compostable'],
      ['recyclable', 'Recyclable', 'Recyclable materials like plastic, glass, paper, metal'],
      ['mixed', 'Mixed', 'Mixed or unknown waste type'],
      ['special', 'Special Waste', 'Special handling (e-waste, medical, etc.)'],
      ['hazardous', 'Hazardous', 'Hazardous/toxic materials']
    ];

    for (const [key, name, desc] of seedCategories) {
      await db.query(
        `
          INSERT INTO waste_categories (category_key, display_name, description, created_by)
          SELECT ?, ?, ?, 1
          WHERE NOT EXISTS (
            SELECT 1 FROM waste_categories WHERE category_key = ?
          )
        `,
        [key, name, desc, key]
      );
    }

    // 3) Add nullable waste_category_id column first (so we can backfill)
    console.log('🛠 Adding waste_category_id column to schedules...');
    await db.query(
      `
        ALTER TABLE schedules
        ADD COLUMN waste_category_id INT NULL AFTER collection_time
      `
    );

    // 4) Backfill waste_category_id from existing waste_type enum using category_key
    console.log('🔄 Backfilling waste_category_id based on existing waste_type column...');
    await db.query(
      `
        UPDATE schedules s
        LEFT JOIN waste_categories wc
          ON wc.category_key = s.waste_type
        SET s.waste_category_id = wc.category_id
        WHERE s.waste_category_id IS NULL
      `
    );

    // 5) Verify that all rows now have a waste_category_id
    const [[missing]] = await db.query(
      'SELECT COUNT(*) AS cnt FROM schedules WHERE waste_category_id IS NULL'
    );

    if (missing.cnt > 0) {
      throw new Error(
        `Migration aborted: ${missing.cnt} schedule(s) still have NULL waste_category_id after backfill.`
      );
    }

    // 6) Add index and foreign key, and make column NOT NULL
    console.log('🔐 Adding index and foreign key constraint on waste_category_id...');
    await db.query(
      `
        ALTER TABLE schedules
        MODIFY COLUMN waste_category_id INT NOT NULL,
        ADD INDEX idx_waste_category (waste_category_id),
        ADD CONSTRAINT fk_schedule_waste_category
          FOREIGN KEY (waste_category_id) REFERENCES waste_categories(category_id)
          ON DELETE RESTRICT
      `
    );

    // 7) Optionally drop legacy waste_type column to match current schema
    console.log('🧹 Dropping legacy waste_type column from schedules...');
    await db.query(
      `
        ALTER TABLE schedules
        DROP COLUMN waste_type
      `
    );

    console.log('🎉 Migration completed: schedules now uses waste_category_id with proper foreign key.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error migrating schedules table:', error);
    process.exit(1);
  }
})();

