const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'church_members',
  user: process.env.DB_USER || 'church_app',
  password: process.env.DB_PASSWORD || 'church_password',
});

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
app.use('/uploads', express.static('uploads'));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes

// Get all families with members
app.get('/api/families', async (req, res) => {
  try {
    const familiesQuery = `
      SELECT f.*, 
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
      GROUP BY f.id
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
    
    const { family_name, registration_status, input_date, notes, family_picture_url, members } = req.body;
    
    // Insert family
    const familyQuery = `
      INSERT INTO families (family_name, registration_status, input_date, notes, family_picture_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const familyResult = await client.query(familyQuery, [
      family_name, registration_status, input_date, notes || '', family_picture_url || ''
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
    const { family_name, registration_status, input_date, notes, family_picture_url } = req.body;
    
    const query = `
      UPDATE families 
      SET family_name = $1, registration_status = $2, input_date = $3, notes = $4, family_picture_url = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      family_name, registration_status, input_date, notes, family_picture_url, familyId
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

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
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