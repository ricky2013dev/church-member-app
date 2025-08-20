# Supabase Storage Setup

## Creating the Storage Bucket

Since the anon key doesn't have permission to create buckets, you need to create the storage bucket manually through the Supabase dashboard:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create Bucket**
4. Use these settings:
   - **Bucket name**: `church-pictures`
   - **Public bucket**: ✅ Checked (so images can be accessed via public URLs)
   - **File size limit**: 5 MB
   - **Allowed MIME types**: `image/*` (or leave empty for all file types)

## Storage Policies

The bucket should be configured with policies that allow:
- **SELECT**: Public read access for displaying images
- **INSERT**: Authenticated users can upload files
- **UPDATE**: Authenticated users can update their files
- **DELETE**: Authenticated users can delete their files

## Service Key (Optional for Production)

For production, you should:
1. Get your Service Key from **Settings** > **API** > **service_role** key
2. Add it to your `.env` file as `SUPABASE_SERVICE_KEY=your_service_key_here`
3. Update the server code to use the service key for server-side operations

The service key has admin privileges and can create buckets, bypass RLS policies, etc.