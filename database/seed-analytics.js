const mysql = require('mysql2/promise');
require('dotenv').config();

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(randFloat(min, max + 1));
}

function approxGaussian() {
  let sum = 0;
  for (let i = 0; i < 6; i++) sum += Math.random();
  return (sum / 6) - 0.5;
}

function inMetroManilaBounds(lat, lng) {
  return lat >= 14.50 && lat <= 14.78 && lng >= 120.96 && lng <= 121.15;
}

function likelyWater(lat, lng) {
  if (lng < 120.99 && lat < 14.66) return true;
  if (lng < 121.00 && lat < 14.58) return true;
  return false;
}

function toMysqlTimestamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function addMinutes(date, minutes) {
  const d = new Date(date.getTime());
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

function weightedPick(items) {
  const total = items.reduce((sum, it) => sum + it.w, 0);
  const r = Math.random() * total;
  let acc = 0;
  for (const it of items) {
    acc += it.w;
    if (r <= acc) return it.v;
  }
  return items[items.length - 1].v;
}

function randomMetroManilaPoint() {
  const centers = [
    { v: { lat: 14.6760, lng: 121.0437 }, w: 0.18 },
    { v: { lat: 14.5547, lng: 121.0244 }, w: 0.14 },
    { v: { lat: 14.5176, lng: 121.0509 }, w: 0.12 },
    { v: { lat: 14.6091, lng: 121.0223 }, w: 0.12 },
    { v: { lat: 14.5995, lng: 120.9842 }, w: 0.12 },
    { v: { lat: 14.6623, lng: 120.9653 }, w: 0.10 },
    { v: { lat: 14.5378, lng: 121.0014 }, w: 0.10 },
    { v: { lat: 14.5764, lng: 121.0851 }, w: 0.12 }
  ];

  for (let attempt = 0; attempt < 40; attempt++) {
    const c = weightedPick(centers);
    const lat = c.lat + approxGaussian() * 0.06;
    const lng = c.lng + approxGaussian() * 0.06;
    const clampedLat = clamp(lat, 14.50, 14.78);
    const clampedLng = clamp(lng, 120.96, 121.15);

    if (!inMetroManilaBounds(clampedLat, clampedLng)) continue;
    if (likelyWater(clampedLat, clampedLng)) continue;

    return { lat: clampedLat, lng: clampedLng };
  }

  return { lat: 14.5995, lng: 121.0244 };
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'wastesense_db'
  });

  const [residents] = await connection.query(
    "SELECT user_id, barangay_id FROM users WHERE role = 'resident' AND is_active = 1 ORDER BY user_id ASC LIMIT 200"
  );
  const [collectors] = await connection.query(
    "SELECT user_id, barangay_id FROM users WHERE role = 'collector' AND is_active = 1 ORDER BY user_id ASC LIMIT 200"
  );
  const [locations] = await connection.query(
    'SELECT location_id FROM locations ORDER BY location_id ASC LIMIT 200'
  );

  if (!residents || residents.length === 0) {
    throw new Error('No active resident users found. Run database/setup.js first.');
  }
  if (!locations || locations.length === 0) {
    throw new Error('No locations found. Run database/setup.js first.');
  }

  const locationIds = locations.map(l => l.location_id);

  const now = new Date();
  const days = 30;
  const seedTag = `analytics_seed_${Date.now()}`;

  await connection.query("DELETE FROM waste_submissions WHERE waste_description LIKE 'analytics_seed_%'");

  const categoryWeights = [
    { v: 'biodegradable', w: 0.33 },
    { v: 'recyclable', w: 0.25 },
    { v: 'non-biodegradable', w: 0.16 },
    { v: 'special', w: 0.11 },
    { v: 'hazardous', w: 0.10 },
    { v: 'mixed', w: 0.05 }
  ];

  const inserts = [];

  for (let i = 0; i < days; i++) {
    const dayBase = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0), -i);
    const weekday = dayBase.getDay();
    const weekdayBoost = (weekday === 0 || weekday === 6) ? 0.65 : 1.0;
    const base = randInt(6, 14);
    const count = Math.max(3, Math.round(base * weekdayBoost));

    for (let j = 0; j < count; j++) {
      const resident = pick(residents);
      const category = weightedPick(categoryWeights);
      const status = 'collected';

      const createdAt = addMinutes(dayBase, randInt(-180, 420));

      const pt = randomMetroManilaPoint();
      const lat = pt.lat;
      const lng = pt.lng;

      const barangayId = resident.barangay_id || pick(locationIds);

      const wasteTypesArr = Math.random() < 0.88 ? [category] : [category, weightedPick(categoryWeights)];
      const wasteTypes = JSON.stringify([...new Set(wasteTypesArr.map(String))]);

      const predictedCategory = category;
      const confidenceScore = randFloat(55, 98).toFixed(2);

      const useConfirmed = Math.random() < 0.55;
      const confirmedCategory = useConfirmed ? category : null;

      let collectorId = null;
      let scheduledDate = null;
      let collectedAt = null;

      const eligibleCollectors = collectors && collectors.length > 0
        ? collectors.filter(c => c.barangay_id && c.barangay_id === barangayId)
        : [];
      collectorId = (eligibleCollectors.length > 0 ? pick(eligibleCollectors) : (collectors && collectors.length > 0 ? pick(collectors) : null))?.user_id || null;

      scheduledDate = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}-${String(createdAt.getDate()).padStart(2, '0')}`;
      collectedAt = toMysqlTimestamp(addMinutes(createdAt, randInt(45, 360)));

      inserts.push([
        resident.user_id,
        collectorId,
        predictedCategory,
        confidenceScore,
        confirmedCategory,
        wasteTypes,
        lat,
        lng,
        `Seeded Address ${randInt(1, 999)}, Barangay ${barangayId}`,
        barangayId,
        status,
        scheduledDate,
        toMysqlTimestamp(createdAt),
        collectedAt,
        seedTag
      ]);
    }
  }

  const sql = `
    INSERT INTO waste_submissions
      (user_id, collector_id, predicted_category, confidence_score, confirmed_category, waste_types,
       latitude, longitude, address_description, barangay_id, collection_status, scheduled_date,
       created_at, collected_at, waste_description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await connection.query('START TRANSACTION');
  try {
    for (const row of inserts) {
      await connection.execute(sql, row);
    }
    await connection.query('COMMIT');
  } catch (e) {
    await connection.query('ROLLBACK');
    throw e;
  }

  const [total] = await connection.query("SELECT COUNT(*) AS cnt FROM waste_submissions WHERE waste_description = ?", [seedTag]);
  const [byStatus] = await connection.query(
    "SELECT collection_status, COUNT(*) AS cnt FROM waste_submissions WHERE waste_description = ? GROUP BY collection_status ORDER BY cnt DESC",
    [seedTag]
  );
  const [byDay] = await connection.query(
    "SELECT DATE(created_at) AS day, COUNT(*) AS cnt FROM waste_submissions WHERE waste_description = ? GROUP BY DATE(created_at) ORDER BY day ASC",
    [seedTag]
  );

  const byTypeCounts = {};
  const [typeRows] = await connection.query(
    "SELECT waste_types FROM waste_submissions WHERE waste_description = ?",
    [seedTag]
  );
  for (const r of (typeRows || [])) {
    let arr = [];
    try { arr = JSON.parse(r.waste_types || '[]'); } catch { arr = []; }
    for (const t of arr) {
      const k = String(t || '').toLowerCase().trim() || 'mixed';
      byTypeCounts[k] = (byTypeCounts[k] || 0) + 1;
    }
  }

  console.log(`Seeded ${total?.[0]?.cnt || 0} submissions: ${seedTag}`);
  console.log('By status:', byStatus);
  console.log('By type:', byTypeCounts);
  console.log(`Daily rows: ${byDay?.length || 0}`);

  await connection.end();
}

main().catch(err => {
  console.error('Seed analytics failed:', err.message);
  process.exit(1);
});
