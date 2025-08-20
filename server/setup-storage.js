const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client with anon key
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function setupStorage() {
  try {
    console.log('Setting up Supabase storage bucket...');
    
    // Try to create the bucket
    const { data: bucket, error: bucketError } = await supabase.storage
      .createBucket('church-pictures', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
    
    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket "church-pictures" already exists');
      } else {
        console.error('❌ Error creating bucket:', bucketError);
        return;
      }
    } else {
      console.log('✅ Bucket "church-pictures" created successfully');
    }
    
    // Test bucket access
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }
    
    const churchBucket = buckets.find(b => b.name === 'church-pictures');
    if (churchBucket) {
      console.log('✅ Bucket "church-pictures" is accessible');
      console.log('Bucket details:', {
        name: churchBucket.name,
        public: churchBucket.public,
        created_at: churchBucket.created_at
      });
    } else {
      console.log('❌ Bucket "church-pictures" not found in list');
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupStorage();