const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

console.error('test', process.env.DB_HOST)

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'church_members',
  user: process.env.DB_USER || 'church_app',
  password: process.env.DB_PASSWORD || 'church_password',
});

// Supabase client for storage
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);


// Mock data for fallback
const mockFamilies = [
  {
    id: 1,
    family_name: '김철수 & 이영희',
    family_picture_url: '',
    registration_status: 'Registration Complete',
    input_date: '2024-08-18',
    notes: '새가족 환영',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    members: [
      {
        id: 1,
        family_id: 1,
        korean_name: '김철수',
        english_name: 'Chul-soo Kim',
        relationship: 'husband',
        phone_number: '010-1234-5678',
        birth_date: '1985-03-15',
        picture_url: '',
        memo: '',
        member_group: null,
        grade_level: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        education_status: []
      },
      {
        id: 2,
        family_id: 1,
        korean_name: '이영희',
        english_name: 'Young-hee Lee',
        relationship: 'wife',
        phone_number: '010-9876-5432',
        birth_date: '1987-07-22',
        picture_url: '',
        memo: '',
        member_group: null,
        grade_level: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        education_status: []
      }
    ]
  },
  {
    id: 2,
    family_name: '박민수',
    family_picture_url: '',
    registration_status: 'Visitor',
    input_date: '2024-08-11',
    notes: '첫 방문',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    members: [
      {
        id: 3,
        family_id: 2,
        korean_name: '박민수',
        english_name: 'Min-soo Park',
        relationship: 'husband',
        phone_number: '010-5555-1234',
        birth_date: '1990-01-10',
        picture_url: '',
        memo: '',
        member_group: null,
        grade_level: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        education_status: []
      }
    ]
  }
];

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration - use memory storage for Supabase
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Routes

// Get all families with members
app.get('/api/families', async (req, res) => {
  try {
    const familiesQuery = `
      SELECT f.*, 
             json_build_object(
               'id', ms.id,
               'name', ms.name,
               'group_code', ms.group_code,
               'created_at', ms.created_at,
               'updated_at', ms.updated_at
             ) as main_supporter,
             json_build_object(
               'id', ss.id,
               'name', ss.name,
               'group_code', ss.group_code,
               'created_at', ss.created_at,
               'updated_at', ss.updated_at
             ) as sub_supporter,
             json_agg(
               json_build_object(
                 'id', m.id,
                 'family_id', m.family_id,
                 'korean_name', m.korean_name,
                 'english_name', m.english_name,
                 'relationship', m.relationship,
                 'phone_number', m.phone_number,
                 'birth_date', m.birth_date,
                 'picture_url', m.picture_url,
                 'memo', m.memo,
                 'member_group', m.member_group,
                 'grade_level', m.grade_level,
                 'created_at', m.created_at,
                 'updated_at', m.updated_at,
                 'education_status', COALESCE(
                   (SELECT json_agg(json_build_object(
                     'id', es.id,
                     'member_id', es.member_id,
                     'course', es.course,
                     'completed', es.completed,
                     'completion_date', es.completion_date,
                     'created_at', es.created_at
                   )) FROM education_status es WHERE es.member_id = m.id), '[]'::json
                 )
               ) ORDER BY m.relationship DESC, m.id
             ) FILTER (WHERE m.id IS NOT NULL) as members
      FROM families f
      LEFT JOIN members m ON f.id = m.family_id
      LEFT JOIN supporters ms ON f.main_supporter_id = ms.id
      LEFT JOIN supporters ss ON f.sub_supporter_id = ss.id
      GROUP BY f.id, ms.id, ms.name, ms.group_code, ms.created_at, ms.updated_at,
               ss.id, ss.name, ss.group_code, ss.created_at, ss.updated_at
      ORDER BY f.input_date DESC, f.id DESC
    `;
    
    const result = await pool.query(familiesQuery);
    
    const families = result.rows.map(row => ({
      ...row,
      members: row.members || []
    }));
    
    res.json(families);
  } catch (error) {
    console.error('Error fetching families, using mock data:', error.message);
    // Return mock data when database connection fails
    res.json(mockFamilies);
  }
});

// Get single family with members
app.get('/api/families/:id', async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    
    const familyQuery = 'SELECT * FROM families WHERE id = $1';
    const familyResult = await pool.query(familyQuery, [familyId]);
    
    if (familyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    const membersQuery = `
      SELECT m.*, 
             COALESCE(
               (SELECT json_agg(json_build_object(
                 'id', es.id,
                 'member_id', es.member_id,
                 'course', es.course,
                 'completed', es.completed,
                 'completion_date', es.completion_date,
                 'created_at', es.created_at
               )) FROM education_status es WHERE es.member_id = m.id), '[]'::json
             ) as education_status
      FROM members m 
      WHERE m.family_id = $1 
      ORDER BY m.relationship DESC, m.id
    `;
    const membersResult = await pool.query(membersQuery, [familyId]);
    
    const family = {
      ...familyResult.rows[0],
      members: membersResult.rows
    };
    
    res.json(family);
  } catch (error) {
    console.error('Error fetching family:', error);
    res.status(500).json({ error: 'Failed to fetch family' });
  }
});

// Create new family with members
app.post('/api/families', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { family_name, registration_status, input_date, notes, address, zipcode, family_picture_url, members, main_supporter_id, sub_supporter_id } = req.body;
    
    // Insert family
    const familyQuery = `
      INSERT INTO families (family_name, registration_status, input_date, notes, address, zipcode, family_picture_url, main_supporter_id, sub_supporter_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const familyResult = await client.query(familyQuery, [
      family_name, registration_status, input_date, notes || '', address || '', zipcode || '', family_picture_url || '', 
      main_supporter_id || null, sub_supporter_id || null
    ]);
    
    const familyId = familyResult.rows[0].id;
    
    // Insert members
    const createdMembers = [];
    for (const member of members) {
      const memberQuery = `
        INSERT INTO members (family_id, korean_name, english_name, relationship, phone_number, birth_date, picture_url, memo, member_group, grade_level)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      const memberResult = await client.query(memberQuery, [
        familyId,
        member.korean_name || null,
        member.english_name || null,
        member.relationship,
        member.phone_number || null,
        member.birth_date || null,
        member.picture_url || null,
        member.memo || null,
        member.member_group || null,
        member.grade_level || null
      ]);
      
      createdMembers.push({
        ...memberResult.rows[0],
        education_status: []
      });
    }
    
    await client.query('COMMIT');
    
    const family = {
      ...familyResult.rows[0],
      members: createdMembers
    };
    
    res.status(201).json(family);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating family:', error);
    res.status(500).json({ error: 'Failed to create family' });
  } finally {
    client.release();
  }
});

// Update family
app.put('/api/families/:id', async (req, res) => {
  try {
    const familyId = parseInt(req.params.id);
    const { family_name, registration_status, input_date, notes, address, zipcode, family_picture_url, main_supporter_id, sub_supporter_id } = req.body;
    
    const query = `
      UPDATE families 
      SET family_name = $1, registration_status = $2, input_date = $3, notes = $4, address = $5, zipcode = $6, 
          family_picture_url = $7, main_supporter_id = $8, sub_supporter_id = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      family_name, registration_status, input_date, notes, address, zipcode, family_picture_url, 
      main_supporter_id || null, sub_supporter_id || null, familyId
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Family not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating family:', error);
    res.status(500).json({ error: 'Failed to update family' });
  }
});

// Create member
app.post('/api/members', async (req, res) => {
  try {
    const { family_id, korean_name, english_name, relationship, phone_number, birth_date, picture_url, memo, member_group, grade_level } = req.body;
    
    const query = `
      INSERT INTO members (family_id, korean_name, english_name, relationship, phone_number, birth_date, picture_url, memo, member_group, grade_level)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      family_id, korean_name, english_name, relationship, phone_number, birth_date, picture_url, memo, member_group, grade_level
    ]);
    
    const member = {
      ...result.rows[0],
      education_status: []
    };
    
    res.status(201).json(member);
  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// Update member
app.put('/api/members/:id', async (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    const { korean_name, english_name, relationship, phone_number, birth_date, picture_url, memo, member_group, grade_level } = req.body;
    
    const query = `
      UPDATE members 
      SET korean_name = $1, english_name = $2, relationship = $3, phone_number = $4, birth_date = $5, picture_url = $6, memo = $7, member_group = $8, grade_level = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      korean_name, english_name, relationship, phone_number, birth_date, picture_url, memo, member_group, grade_level, memberId
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member
app.delete('/api/members/:id', async (req, res) => {
  try {
    const memberId = parseInt(req.params.id);
    
    const result = await pool.query('DELETE FROM members WHERE id = $1 RETURNING *', [memberId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// Get weekly statistics
app.get('/api/stats/weekly', async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_TRUNC('week', input_date) as week,
        COUNT(*) as new_families,
        (SELECT COUNT(*) FROM families WHERE input_date <= DATE_TRUNC('week', f.input_date) + interval '6 days') as total_families
      FROM families f
      WHERE input_date >= CURRENT_DATE - interval '6 weeks'
      GROUP BY DATE_TRUNC('week', input_date)
      ORDER BY week DESC
    `;
    
    const result = await pool.query(query);
    
    const stats = result.rows.map(row => ({
      week: row.week.toISOString().split('T')[0],
      new_families: parseInt(row.new_families),
      total_families: parseInt(row.total_families)
    }));
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching weekly stats, using mock data:', error.message);
    // Return mock weekly stats when database connection fails
    const mockWeeklyStats = [
      { week: '2024-08-18', new_families: 3, total_families: 45 },
      { week: '2024-08-11', new_families: 2, total_families: 42 },
      { week: '2024-08-04', new_families: 1, total_families: 40 },
      { week: '2024-07-28', new_families: 4, total_families: 39 },
      { week: '2024-07-21', new_families: 2, total_families: 35 },
      { week: '2024-07-14', new_families: 1, total_families: 33 },
    ];
    res.json(mockWeeklyStats);
  }
});

// File upload endpoint - using Supabase Storage
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const file = req.file;
    const type = req.body.type || 'general'; // 'family' or 'member' or 'general'
    
    // Generate unique filename
    const fileExt = path.extname(file.originalname);
    const fileName = `${type}/${Date.now()}-${Math.round(Math.random() * 1E9)}${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('church-pictures')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      
      if (error.message && error.message.includes('Bucket not found')) {
        return res.status(500).json({ 
          error: 'Storage bucket not found. Please create the "church-pictures" bucket in Supabase Dashboard.',
          details: 'Go to Storage > Create Bucket > Name: "church-pictures" > Public: true'
        });
      }
      
      return res.status(500).json({ 
        error: 'Failed to upload file to storage',
        details: error.message 
      });
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('church-pictures')
      .getPublicUrl(fileName);
    
    res.json({ url: publicUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Supporter endpoints

// Get all supporters
app.get('/api/supporters', async (req, res) => {
  try {
    const { group_code, status } = req.query;
    
    let query = 'SELECT * FROM supporters ORDER BY status DESC, name ASC';
    let params = [];
    
    const conditions = [];
    if (group_code) {
      conditions.push(`group_code = $${params.length + 1}`);
      params.push(group_code);
    }
    
    if (status) {
      conditions.push(`status = $${params.length + 1}`);
      params.push(status);
    }
    
    if (conditions.length > 0) {
      query = `SELECT * FROM supporters WHERE ${conditions.join(' AND ')} ORDER BY status DESC, name ASC`;
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching supporters:', error);
    res.status(500).json({ error: 'Failed to fetch supporters' });
  }
});

// Get single supporter
app.get('/api/supporters/:id', async (req, res) => {
  try {
    const supporterId = parseInt(req.params.id);
    const result = await pool.query('SELECT * FROM supporters WHERE id = $1', [supporterId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supporter not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching supporter:', error);
    res.status(500).json({ error: 'Failed to fetch supporter' });
  }
});

// Create supporter
app.post('/api/supporters', async (req, res) => {
  try {
    const { name, group_code, phone_number, email, profile_picture_url, gender, status, pin_code, display_sort } = req.body;
    
    if (!name || !group_code || !gender || !pin_code) {
      return res.status(400).json({ error: 'Name, group_code, gender, and pin_code are required' });
    }
    
    // Validate group_code exists in database
    const groupCodeCheck = await pool.query('SELECT COUNT(*) FROM group_pin_codes WHERE group_code = $1', [group_code]);
    if (parseInt(groupCodeCheck.rows[0].count) === 0) {
      return res.status(400).json({ error: 'Invalid group_code. Group code does not exist.' });
    }
    
    if (!['male', 'female'].includes(gender)) {
      return res.status(400).json({ error: 'Invalid gender. Must be male or female' });
    }
    
    if (!/^\d{4}$/.test(pin_code)) {
      return res.status(400).json({ error: 'Pin code must be exactly 4 digits' });
    }
    
    const supporterStatus = status || 'on';
    if (!['on', 'off'].includes(supporterStatus)) {
      return res.status(400).json({ error: 'Invalid status. Must be on or off' });
    }
    
    const query = `
      INSERT INTO supporters (name, group_code, phone_number, email, profile_picture_url, gender, status, pin_code, display_sort)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, group_code, phone_number || null, email || null, 
      profile_picture_url || null, gender, supporterStatus, pin_code, display_sort || 0
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating supporter:', error);
    res.status(500).json({ error: 'Failed to create supporter' });
  }
});

// Update supporter
app.put('/api/supporters/:id', async (req, res) => {
  try {
    const supporterId = parseInt(req.params.id);
    const { name, group_code, phone_number, email, profile_picture_url, gender, status, pin_code, display_sort } = req.body;
    
    if (!name || !group_code || !gender || !pin_code) {
      return res.status(400).json({ error: 'Name, group_code, gender, and pin_code are required' });
    }
    
    // Validate group_code exists in database
    const groupCodeCheck = await pool.query('SELECT COUNT(*) FROM group_pin_codes WHERE group_code = $1', [group_code]);
    if (parseInt(groupCodeCheck.rows[0].count) === 0) {
      return res.status(400).json({ error: 'Invalid group_code. Group code does not exist.' });
    }
    
    if (!['male', 'female'].includes(gender)) {
      return res.status(400).json({ error: 'Invalid gender. Must be male or female' });
    }
    
    if (!/^\d{4}$/.test(pin_code)) {
      return res.status(400).json({ error: 'Pin code must be exactly 4 digits' });
    }
    
    const supporterStatus = status || 'on';
    if (!['on', 'off'].includes(supporterStatus)) {
      return res.status(400).json({ error: 'Invalid status. Must be on or off' });
    }
    
    const query = `
      UPDATE supporters 
      SET name = $1, group_code = $2, phone_number = $3, email = $4, profile_picture_url = $5, 
          gender = $6, status = $7, pin_code = $8, display_sort = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      name, group_code, phone_number || null, email || null, 
      profile_picture_url || null, gender, supporterStatus, pin_code, display_sort || 0, supporterId
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supporter not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating supporter:', error);
    res.status(500).json({ error: 'Failed to update supporter' });
  }
});

// Delete supporter
app.delete('/api/supporters/:id', async (req, res) => {
  try {
    const supporterId = parseInt(req.params.id);
    
    // Check if supporter is being used by any families
    const familyCheck = await pool.query(
      'SELECT COUNT(*) FROM families WHERE main_supporter_id = $1 OR sub_supporter_id = $1',
      [supporterId]
    );
    
    if (parseInt(familyCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete supporter. This supporter is assigned to one or more families.' 
      });
    }
    
    const result = await pool.query('DELETE FROM supporters WHERE id = $1 RETURNING *', [supporterId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Supporter not found' });
    }
    
    res.json({ message: 'Supporter deleted successfully' });
  } catch (error) {
    console.error('Error deleting supporter:', error);
    res.status(500).json({ error: 'Failed to delete supporter' });
  }
});

// Authentication endpoints

// Login with pin codes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { supporter_id, pin_code, group_pin_code } = req.body;
    
    if (!supporter_id || !pin_code || !group_pin_code) {
      return res.status(400).json({ error: 'supporter_id, pin_code, and group_pin_code are required' });
    }
    
    if (!/^\d{4}$/.test(pin_code) || !/^\d{4}$/.test(group_pin_code)) {
      return res.status(400).json({ error: 'Pin codes must be exactly 4 digits' });
    }
    
    // Find supporter by ID and verify pin code
    const supporterResult = await pool.query(
      'SELECT * FROM supporters WHERE id = $1 AND pin_code = $2 AND status = $3',
      [supporter_id, pin_code, 'on']
    );
    
    if (supporterResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid supporter ID, pin code, or supporter is inactive' });
    }
    
    const supporter = supporterResult.rows[0];
    
    // Verify group pin code
    const groupPinResult = await pool.query(
      'SELECT * FROM group_pin_codes WHERE group_code = $1 AND pin_code = $2',
      [supporter.group_code, group_pin_code]
    );
    
    if (groupPinResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid group pin code for this supporter group' });
    }
    
    // Login successful
    res.json({
      success: true,
      supporter: {
        id: supporter.id,
        name: supporter.name,
        group_code: supporter.group_code,
        gender: supporter.gender,
        phone_number: supporter.phone_number,
        email: supporter.email,
        profile_picture_url: supporter.profile_picture_url
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Group pin code management endpoints

// Get all group pin codes (only for CAR supporters)
app.get('/api/group-pin-codes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM group_pin_codes ORDER BY group_code');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching group pin codes:', error);
    res.status(500).json({ error: 'Failed to fetch group pin codes' });
  }
});

// Update group pin code (only for CAR supporters)
app.put('/api/group-pin-codes/:group_code', async (req, res) => {
  try {
    const { group_code } = req.params;
    const { pin_code } = req.body;
    
    // Validate group_code exists in database
    const groupCodeCheck = await pool.query('SELECT COUNT(*) FROM group_pin_codes WHERE group_code = $1', [group_code]);
    if (parseInt(groupCodeCheck.rows[0].count) === 0) {
      return res.status(400).json({ error: 'Invalid group_code. Group code does not exist.' });
    }
    
    if (!/^\d{4}$/.test(pin_code)) {
      return res.status(400).json({ error: 'Pin code must be exactly 4 digits' });
    }
    
    const query = `
      UPDATE group_pin_codes 
      SET pin_code = $1, updated_at = CURRENT_TIMESTAMP
      WHERE group_code = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [pin_code, group_code]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Group code not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating group pin code:', error);
    res.status(500).json({ error: 'Failed to update group pin code' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
  console.log(`Church Member API server running on port ${port}`);
  console.log(`Health check: http://localhost:${port}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  pool.end(() => {
    console.log('Database pool closed.');
    process.exit(0);
  });
});