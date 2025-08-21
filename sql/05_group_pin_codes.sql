-- Group Pin Codes table
-- Stores pin codes and names for different supporter groups

CREATE TABLE IF NOT EXISTS group_pin_codes (
    id SERIAL PRIMARY KEY,
    group_code VARCHAR(3) NOT NULL UNIQUE,
    pin_code VARCHAR(4) NOT NULL,
    group_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at on group_pin_codes
CREATE TRIGGER update_group_pin_codes_updated_at 
    BEFORE UPDATE ON group_pin_codes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default group pin codes
INSERT INTO group_pin_codes (group_code, pin_code, group_name) VALUES
('NOR', '0000', 'Normal'),
('CAR', '0000', 'Care'),
('ALL', '0000', 'All')
ON CONFLICT (group_code) DO NOTHING;