-- Families table
-- Stores family information and registration status

CREATE TABLE IF NOT EXISTS families (
    id SERIAL PRIMARY KEY,
    family_name VARCHAR(255) NOT NULL,
    family_picture_url VARCHAR(500),
    registration_status VARCHAR(50) NOT NULL DEFAULT 'Visitor' CHECK (registration_status IN ('Visitor', 'Registration Complete')),
    input_date DATE NOT NULL,
    notes TEXT,
    address TEXT,
    zipcode VARCHAR(10),
    main_supporter_id INTEGER,
    sub_supporter_id INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_families_input_date ON families(input_date);
CREATE INDEX IF NOT EXISTS idx_families_main_supporter ON families(main_supporter_id);
CREATE INDEX IF NOT EXISTS idx_families_sub_supporter ON families(sub_supporter_id);

-- Foreign key constraints will be added after supporters table is created
-- ALTER TABLE families ADD CONSTRAINT families_main_supporter_id_fkey 
--     FOREIGN KEY (main_supporter_id) REFERENCES supporters(id) ON DELETE SET NULL;
-- ALTER TABLE families ADD CONSTRAINT families_sub_supporter_id_fkey 
--     FOREIGN KEY (sub_supporter_id) REFERENCES supporters(id) ON DELETE SET NULL;