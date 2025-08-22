const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'church_members',
  user: process.env.DB_USER || 'church_app',
  password: process.env.DB_PASSWORD || 'church_password',
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🚀 Starting events table migration...');

    // Read and execute the events migration SQL
    const migrationPath = path.join(__dirname, '../sql/09_events.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    await client.query(migrationSQL);

    console.log('✅ Events tables created successfully!');
    console.log('📝 Created tables: events, event_responses');
    console.log('🔗 Added indexes and triggers');

    // Insert sample data for testing
    console.log('📋 Adding sample data...');

    // Check if ADM (admin) group exists in supporters, if not create it
    const adminCheck = await client.query(
      "SELECT id FROM supporters WHERE group_code = 'ADM' LIMIT 1"
    );
    let adminId = null;

    if (adminCheck.rows.length === 0) {
      console.log(
        '⚠️  No ADM supporter found. Creating sample admin supporter...'
      );
      const adminResult = await client.query(`
        INSERT INTO supporters (name, group_code, phone_number, gender, status, pin_code, display_sort) 
        VALUES ('Admin User', 'ADM', '010-0000-0000', 'male', 'on', '0000', 99)
        RETURNING id
      `);
      adminId = adminResult.rows[0].id;
      console.log('✅ Sample admin supporter created with ID:', adminId);
    } else {
      adminId = adminCheck.rows[0].id;
      console.log('✅ Found existing admin supporter with ID:', adminId);
    }

    // Insert sample events
    const sampleEvents = [
      {
        name: 'Monthly Team Meeting',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 1 week from now
      },
      {
        name: 'Volunteer Training Session',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 2 weeks from now
      },
      {
        name: 'Community Outreach Event',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 3 weeks from now
      },
    ];

    for (const event of sampleEvents) {
      await client.query(
        'INSERT INTO events (event_name, event_date, created_by) VALUES ($1, $2, $3)',
        [event.name, event.date, adminId]
      );
      console.log(`📅 Added sample event: ${event.name} on ${event.date}`);
    }

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function main() {
  try {
    await runMigration();
    console.log('🏁 All done!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

main();
