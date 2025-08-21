-- Foreign Key Constraints
-- Add foreign key relationships between tables

-- Add foreign key constraints for families table to supporters
ALTER TABLE families ADD CONSTRAINT families_main_supporter_id_fkey 
    FOREIGN KEY (main_supporter_id) REFERENCES supporters(id) ON DELETE SET NULL;

ALTER TABLE families ADD CONSTRAINT families_sub_supporter_id_fkey 
    FOREIGN KEY (sub_supporter_id) REFERENCES supporters(id) ON DELETE SET NULL;