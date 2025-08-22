-- Members table
-- Stores individual family member information

CREATE TABLE IF NOT EXISTS members (
    id SERIAL PRIMARY KEY,
    family_id INTEGER NOT NULL,
    korean_name VARCHAR(100),
    english_name VARCHAR(100),
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('husband', 'wife', 'child')),
    phone_number VARCHAR(20),
    birth_date DATE,
    picture_url TEXT DEFAULT '',
    memo TEXT DEFAULT '',
    member_group VARCHAR(50) CHECK (member_group IN ('college', 'youth', 'kid', 'kinder')),
    grade_level VARCHAR(50) DEFAULT '',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_members_family_id ON members(family_id);

-- Foreign key constraint
ALTER TABLE members ADD CONSTRAINT members_family_id_fkey 
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE;