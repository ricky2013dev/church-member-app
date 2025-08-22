const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function testLifeGroup() {
  try {
    console.log('🧪 Testing life_group field functionality...\n');

    // Test data with life_group
    const familyData = {
      family_name: 'Test Life Group Family',
      registration_status: 'Visitor',
      input_date: '2024-08-22',
      notes: 'Testing life_group field',
      address: '123 Test Street',
      zipcode: '12345',
      life_group: 'Alpha Test Group',
      family_picture_url: '',
      main_supporter_id: null,
      sub_supporter_id: null,
      members: [
        {
          korean_name: '테스트',
          english_name: 'Test Person',
          relationship: 'husband',
          phone_number: '010-0000-0000',
          birth_date: '1990-01-01',
          picture_url: '',
          memo: 'Test member',
          member_group: null,
          grade_level: ''
        }
      ]
    };

    console.log('📤 Creating family with life_group:', familyData.life_group);
    
    // Create family
    const createResponse = await fetch(`${API_BASE}/families`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(familyData)
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${createResponse.status} ${createResponse.statusText}`);
    }

    const createdFamily = await createResponse.json();
    console.log('✅ Family created successfully');
    console.log('   Family ID:', createdFamily.id);
    console.log('   Life Group:', createdFamily.life_group);

    if (createdFamily.life_group !== familyData.life_group) {
      console.log('❌ ERROR: life_group was not saved correctly!');
      console.log('   Expected:', familyData.life_group);
      console.log('   Actual:', createdFamily.life_group);
      return;
    }

    // Test updating life_group
    const updatedLifeGroup = 'Beta Updated Group';
    console.log('\n📤 Updating life_group to:', updatedLifeGroup);
    
    const updateResponse = await fetch(`${API_BASE}/families/${createdFamily.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...createdFamily,
        life_group: updatedLifeGroup
      })
    });

    if (!updateResponse.ok) {
      throw new Error(`Update failed: ${updateResponse.status} ${updateResponse.statusText}`);
    }

    const updatedFamily = await updateResponse.json();
    console.log('✅ Family updated successfully');
    console.log('   Life Group:', updatedFamily.life_group);

    if (updatedFamily.life_group !== updatedLifeGroup) {
      console.log('❌ ERROR: life_group was not updated correctly!');
      console.log('   Expected:', updatedLifeGroup);
      console.log('   Actual:', updatedFamily.life_group);
      return;
    }

    // Test retrieving family
    console.log('\n📥 Retrieving family to verify persistence...');
    
    const getResponse = await fetch(`${API_BASE}/families/${createdFamily.id}`);
    
    if (!getResponse.ok) {
      throw new Error(`Get failed: ${getResponse.status} ${getResponse.statusText}`);
    }

    const retrievedFamily = await getResponse.json();
    console.log('✅ Family retrieved successfully');
    console.log('   Life Group:', retrievedFamily.life_group);

    if (retrievedFamily.life_group !== updatedLifeGroup) {
      console.log('❌ ERROR: life_group was not persisted correctly!');
      console.log('   Expected:', updatedLifeGroup);
      console.log('   Actual:', retrievedFamily.life_group);
      return;
    }

    console.log('\n🎉 All life_group tests passed successfully!');
    console.log('✅ Create: life_group saved correctly');
    console.log('✅ Update: life_group updated correctly');
    console.log('✅ Retrieve: life_group persisted correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testLifeGroup();