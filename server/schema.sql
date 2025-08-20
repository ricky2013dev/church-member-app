-- Church Member Management System Database Schema

-- Create families table
CREATE TABLE IF NOT EXISTS families (
    id SERIAL PRIMARY KEY,
    family_name VARCHAR(255) NOT NULL,
    family_picture_url TEXT DEFAULT '',
    registration_status VARCHAR(50) NOT NULL CHECK (registration_status IN ('Visitor', 'Registration Complete')),
    input_date DATE NOT NULL,
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    korean_name VARCHAR(100),
    english_name VARCHAR(100),
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('husband', 'wife', 'child')),
    phone_number VARCHAR(20),
    birth_date DATE,
    picture_url TEXT DEFAULT '',
    memo TEXT DEFAULT '',
    member_group VARCHAR(50) CHECK (member_group IN ('college', 'youth', 'kid', 'kinder')),
    grade_level VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create education_status table
CREATE TABLE IF NOT EXISTS education_status (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    course VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_family_id ON members(family_id);
CREATE INDEX IF NOT EXISTS idx_education_status_member_id ON education_status(member_id);
CREATE INDEX IF NOT EXISTS idx_families_input_date ON families(input_date);