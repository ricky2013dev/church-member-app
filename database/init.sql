-- Church Member Management Database Schema

-- Create families table
CREATE TABLE families (
    id SERIAL PRIMARY KEY,
    family_name VARCHAR(255) NOT NULL,
    family_picture_url VARCHAR(500),
    registration_status VARCHAR(50) DEFAULT 'Visitor',
    input_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create members table
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    family_id INTEGER REFERENCES families(id) ON DELETE CASCADE,
    korean_name VARCHAR(255),
    english_name VARCHAR(255),
    relationship VARCHAR(50) NOT NULL, -- husband, wife, child
    phone_number VARCHAR(20),
    birth_date DATE,
    picture_url VARCHAR(500),
    memo TEXT,
    member_group VARCHAR(50), -- college, youth, kid, kinder (for children)
    grade_level VARCHAR(10), -- for children
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create education_status table
CREATE TABLE education_status (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    course VARCHAR(10) NOT NULL, -- 101, 201, 301, 401
    completed BOOLEAN DEFAULT FALSE,
    completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_families_input_date ON families(input_date);
CREATE INDEX idx_families_registration_status ON families(registration_status);
CREATE INDEX idx_members_family_id ON members(family_id);
CREATE INDEX idx_members_relationship ON members(relationship);
CREATE INDEX idx_education_status_member_id ON education_status(member_id);

-- Insert sample data
INSERT INTO families (family_name, registration_status, input_date, notes) VALUES
('김철수 & 이영희', 'Registration Complete', '2024-08-18', '새가족 환영'),
('박민수', 'Visitor', '2024-08-11', '첫 방문');

INSERT INTO members (family_id, korean_name, english_name, relationship, phone_number, birth_date, member_group) VALUES
(1, '김철수', 'Chul-soo Kim', 'husband', '010-1234-5678', '1985-03-15', NULL),
(1, '이영희', 'Young-hee Lee', 'wife', '010-9876-5432', '1987-07-22', NULL),
(1, '김민지', 'Min-ji Kim', 'child', NULL, '2010-12-05', 'youth'),
(2, '박민수', 'Min-soo Park', 'husband', '010-5555-1234', '1990-01-10', NULL);

INSERT INTO education_status (member_id, course, completed) VALUES
(1, '101', true),
(1, '201', true),
(2, '101', true),
(4, '101', false);