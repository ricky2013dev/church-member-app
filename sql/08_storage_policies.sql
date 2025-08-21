-- Storage bucket and policies setup for church-pictures

-- First, create the bucket if it doesn't exist
-- (This needs to be done manually in the dashboard since anon key doesn't have permissions)

-- Enable RLS on storage.objects (if not already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow public read access (for displaying images)
CREATE POLICY "Public read access for church pictures" ON storage.objects
  FOR SELECT USING (bucket_id = 'church-pictures');

-- Policy 2: Allow anyone to upload to church-pictures bucket
-- This is permissive for development - in production you might want to restrict to authenticated users
CREATE POLICY "Public upload access for church pictures" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'church-pictures');

-- Policy 3: Allow users to update files in church-pictures bucket
CREATE POLICY "Public update access for church pictures" ON storage.objects
  FOR UPDATE USING (bucket_id = 'church-pictures');

-- Policy 4: Allow users to delete files in church-pictures bucket
CREATE POLICY "Public delete access for church pictures" ON storage.objects
  FOR DELETE USING (bucket_id = 'church-pictures');

-- Alternative: If you want to restrict to authenticated users only, use these policies instead:
-- 
-- CREATE POLICY "Authenticated read access for church pictures" ON storage.objects
--   FOR SELECT USING (bucket_id = 'church-pictures' AND auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Authenticated upload access for church pictures" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'church-pictures' AND auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Authenticated update access for church pictures" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'church-pictures' AND auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Authenticated delete access for church pictures" ON storage.objects
--   FOR DELETE USING (bucket_id = 'church-pictures' AND auth.role() = 'authenticated');

-- Also need to create policies for storage.buckets table
CREATE POLICY "Public read access to church-pictures bucket" ON storage.buckets
  FOR SELECT USING (id = 'church-pictures');

-- Grant necessary permissions
-- GRANT ALL ON storage.objects TO anon, authenticated;
-- GRANT ALL ON storage.buckets TO anon, authenticated;