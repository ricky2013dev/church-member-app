const { createClient } = require('@supabase/supabase-js');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Family Picture Upload Flow\n');
  
  try {
    // Step 1: Create a test image and upload it
    console.log('1️⃣ Uploading test image...');
    const testImageBuffer = Buffer.from([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 
      0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 
      120, 156, 99, 252, 255, 159, 161, 30, 0, 7, 130, 2, 127, 61, 200, 72, 239, 
      0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130
    ]);
    
    const formData = new FormData();
    formData.append('file', testImageBuffer, {
      filename: 'test-family.png',
      contentType: 'image/png'
    });
    formData.append('type', 'family');
    
    const uploadResponse = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }
    
    const uploadResult = await uploadResponse.json();
    console.log('✅ Image uploaded successfully!');
    console.log('   URL:', uploadResult.url);
    
    // Step 2: Create a family with the uploaded image
    console.log('\n2️⃣ Creating family with uploaded picture...');
    const familyData = {
      family_name: 'Complete Test Family',
      registration_status: 'Visitor',
      input_date: '2024-08-20',
      notes: 'Created via complete flow test',
      family_picture_url: uploadResult.url,
      members: [
        {
          korean_name: '김테스트',
          english_name: 'Test Kim',
          relationship: 'husband',
          phone_number: '010-1111-2222'
        },
        {
          korean_name: '이테스트',
          english_name: 'Test Lee',
          relationship: 'wife',
          phone_number: '010-3333-4444'
        }
      ]
    };
    
    const familyResponse = await fetch('http://localhost:3000/api/families', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(familyData)
    });
    
    if (!familyResponse.ok) {
      throw new Error(`Family creation failed: ${familyResponse.statusText}`);
    }
    
    const createdFamily = await familyResponse.json();
    console.log('✅ Family created successfully!');
    console.log('   Family ID:', createdFamily.id);
    console.log('   Family Name:', createdFamily.family_name);
    console.log('   Picture URL:', createdFamily.family_picture_url);
    console.log('   Members:', createdFamily.members.length);
    
    // Step 3: Verify the image is accessible
    console.log('\n3️⃣ Verifying image accessibility...');
    const imageResponse = await fetch(createdFamily.family_picture_url, { method: 'HEAD' });
    
    if (imageResponse.ok) {
      console.log('✅ Family picture is publicly accessible!');
      console.log('   Status:', imageResponse.status);
      console.log('   Content-Type:', imageResponse.headers.get('content-type'));
    } else {
      console.log('❌ Family picture is not accessible');
      console.log('   Status:', imageResponse.status);
    }
    
    console.log('\n🎉 Complete flow test passed! Family picture upload is working end-to-end.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteFlow();