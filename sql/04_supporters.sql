-- Supporters table
-- Stores supporter/user information for family management

CREATE TABLE IF NOT EXISTS supporters (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    group_code VARCHAR(3) NOT NULL,
    phone_number VARCHAR(20),
    email VARCHAR(255),
    profile_picture_url TEXT,
    gender VARCHAR(6) NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female')),
    status VARCHAR(3) NOT NULL DEFAULT 'on' CHECK (status IN ('on', 'off')),
    pin_code VARCHAR(4) NOT NULL,
    display_sort SMALLINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_supporters_group_code ON supporters(group_code);
CREATE INDEX IF NOT EXISTS idx_supporters_status ON supporters(status);
CREATE INDEX IF NOT EXISTS idx_supporters_status_group ON supporters(status, group_code);

-- Insert sample supporters data
INSERT INTO supporters (name, group_code, gender, status, pin_code, display_sort) VALUES
('김지혜', 'NOR', 'female', 'on', '1234', 1),
('김어드', 'ALL', 'male', 'on', '4321', 99),
('이선희', 'NOR', 'female', 'on', '1234', 2),
('최승환', 'NOR', 'male', 'on', '1234', 3),
('김향숙', 'NOR', 'female', 'on', '1234', 7)
ON CONFLICT DO NOTHING;