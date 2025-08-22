-- Education Status table
-- Tracks member completion of various courses

CREATE TABLE IF NOT EXISTS education_status (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    course VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completion_date DATE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_education_status_member_id ON education_status(member_id);

-- Foreign key constraint
ALTER TABLE education_status ADD CONSTRAINT education_status_member_id_fkey 
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;