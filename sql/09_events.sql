-- Events table for tracking church events
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    event_name VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    created_by INTEGER REFERENCES supporters(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Event attendance/responses table
CREATE TABLE IF NOT EXISTS event_responses (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    supporter_id INTEGER NOT NULL REFERENCES supporters(id) ON DELETE CASCADE,
    attendance_status VARCHAR(20) NOT NULL CHECK (attendance_status IN ('Join', 'Not Able', 'Not Decide')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one response per supporter per event
    UNIQUE(event_id, supporter_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_event_responses_event_id ON event_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_event_responses_supporter_id ON event_responses(supporter_id);

-- Update trigger for events table
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_events_updated_at ON events;
CREATE TRIGGER trigger_update_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW
    EXECUTE FUNCTION update_events_updated_at();

-- Update trigger for event_responses table
CREATE OR REPLACE FUNCTION update_event_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_event_responses_updated_at ON event_responses;
CREATE TRIGGER trigger_update_event_responses_updated_at
    BEFORE UPDATE ON event_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_event_responses_updated_at();