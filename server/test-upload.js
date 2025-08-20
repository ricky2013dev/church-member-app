const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// Create Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testUpload() {
  try {
    console.log('Testing Supabase storage upload...');
    
    // Create a simple test image buffer
    const testImageBuffer = Buffer.from([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 
      0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 
      120, 156, 99, 252, 255, 159, 161, 30, 0, 7, 130, 2, 127, 61, 200, 72, 239, 
      0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
    ]);
    
    const fileName = `test/test-${Date.now()}.png`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('church-pictures')
      .upload(fileName, testImageBuffer, {
        contentType: 'image/png',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Upload failed:', error);
      
      if (error.message && error.message.includes('Bucket not found')) {
        console.log('\n📋 SETUP REQUIRED:');
        console.log('1. Go to https://supabase.com/dashboard');
        console.log('2. Navigate to Storage');
        console.log('3. Create a bucket named "church-pictures"');
        console.log('4. Make it public');
        console.log('5. Run this test again');
      }
      
      return;
    }
    
    console.log('✅ Upload successful!');
    console.log('File path:', data.path);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('church-pictures')
      .getPublicUrl(fileName);
    
    console.log('✅ Public URL:', publicUrl);
    
    // Clean up - delete the test file
    const { error: deleteError } = await supabase.storage
      .from('church-pictures')
      .remove([fileName]);
    
    if (deleteError) {
      console.warn('⚠️  Could not clean up test file:', deleteError);
    } else {
      console.log('✅ Test file cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUpload();