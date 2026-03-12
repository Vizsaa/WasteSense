const mysql = require('mysql2/promise');
require('dotenv').config();

const METRO_MANILA_LOCATIONS = [
  { barangay_name: 'Ermita', municipality: 'Manila', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Malate', municipality: 'Manila', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Intramuros', municipality: 'Manila', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Tondo', municipality: 'Manila', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Diliman', municipality: 'Quezon City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Commonwealth', municipality: 'Quezon City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Cubao', municipality: 'Quezon City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Batasan Hills', municipality: 'Quezon City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Poblacion', municipality: 'Makati City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Bel-Air', municipality: 'Makati City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'San Lorenzo', municipality: 'Makati City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Bagumbayan', municipality: 'Taguig City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Fort Bonifacio', municipality: 'Taguig City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Pinagsama', municipality: 'Taguig City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Kapitolyo', municipality: 'Pasig City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Ugong', municipality: 'Pasig City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Bagong Ilog', municipality: 'Pasig City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Wack-Wack Greenhills', municipality: 'Mandaluyong City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Highway Hills', municipality: 'Mandaluyong City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Greenhills', municipality: 'San Juan City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Ermitaño', municipality: 'San Juan City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Malibay', municipality: 'Pasay City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Villamor', municipality: 'Pasay City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'BF Homes', municipality: 'Parañaque City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Don Bosco', municipality: 'Parañaque City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Alabang', municipality: 'Muntinlupa City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Tunasan', municipality: 'Muntinlupa City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Pulang Lupa Uno', municipality: 'Las Piñas City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Talon Uno', municipality: 'Las Piñas City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Bagong Silang', municipality: 'Caloocan City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Grace Park', municipality: 'Caloocan City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Marulas', municipality: 'Valenzuela City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Karuhatan', municipality: 'Valenzuela City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Concepcion Uno', municipality: 'Marikina City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Marikina Heights', municipality: 'Marikina City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Longos', municipality: 'Malabon City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'Bayan-Bayanan', municipality: 'Malabon City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Tangos', municipality: 'Navotas City', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'San Jose', municipality: 'Navotas City', province: 'Metro Manila', zone_or_street: null },

  { barangay_name: 'Poblacion', municipality: 'Pateros', province: 'Metro Manila', zone_or_street: null },
  { barangay_name: 'San Pedro', municipality: 'Pateros', province: 'Metro Manila', zone_or_street: null }
];

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wastesense_db'
  });

  const selectSql = `
    SELECT location_id
    FROM locations
    WHERE barangay_name = ?
      AND municipality = ?
      AND province = ?
    LIMIT 1
  `;

  const insertSql = `
    INSERT INTO locations (barangay_name, municipality, province, zone_or_street, is_active)
    VALUES (?, ?, ?, ?, 1)
  `;

  let inserted = 0;
  let skipped = 0;

  await connection.query('START TRANSACTION');
  try {
    for (const loc of METRO_MANILA_LOCATIONS) {
      const [rows] = await connection.execute(selectSql, [loc.barangay_name, loc.municipality, loc.province]);
      if (rows && rows.length > 0) {
        skipped += 1;
        continue;
      }
      await connection.execute(insertSql, [
        loc.barangay_name,
        loc.municipality,
        loc.province,
        loc.zone_or_street || null
      ]);
      inserted += 1;
    }
    await connection.query('COMMIT');
  } catch (e) {
    await connection.query('ROLLBACK');
    throw e;
  }

  const [totalMetro] = await connection.query(
    "SELECT COUNT(*) AS cnt FROM locations WHERE province = 'Metro Manila' AND is_active = 1"
  );

  console.log(`Inserted ${inserted}, skipped ${skipped}.`);
  console.log(`Active Metro Manila locations: ${totalMetro?.[0]?.cnt || 0}`);

  await connection.end();
}

main().catch(err => {
  console.error('Seed Metro Manila locations failed:', err.message);
  process.exit(1);
});

