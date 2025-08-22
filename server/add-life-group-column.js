const { Pool } = require('pg');
require('dotenv').config();

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'church_members',
  user: process.env.DB_USER || 'church_app',
  password: process.env.DB_PASSWORD || 'church_password',
});

async function addLifeGroupColumn() {
  const client = await pool.connect();
  
  try {
    console.log('Adding life_group column to families table...');
    
    // Check if the column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'families' AND column_name = 'life_group'
    `;
    
    const columnExists = await client.query(checkColumnQuery);
    
    if (columnExists.rows.length > 0) {
      console.log('✅ life_group column already exists in families table');
      return;
    }
    
    // Add the life_group column
    const addColumnQuery = `
      ALTER TABLE families 
      ADD COLUMN life_group TEXT
    `;
    
    await client.query(addColumnQuery);
    console.log('✅ Successfully added life_group column to families table');
    
  } catch (error) {
    console.error('❌ Error adding life_group column:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
addLifeGroupColumn()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });