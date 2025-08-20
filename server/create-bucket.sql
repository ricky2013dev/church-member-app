-- Create storage bucket directly via SQL
-- This inserts into the storage.buckets table

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'church-pictures',
  'church-pictures', 
  true,
  5242880, -- 5MB in bytes
  ARRAY['image/*']
)
ON CONFLICT (id) DO NOTHING;