// Test to verify all generated dates are Sundays
const verifySundayDates = () => {
  console.log('Verifying Sunday date generation...\n');
  
  const today = new Date();
  console.log(`Today is: ${today.toDateString()} (Day ${today.getDay()})\n`);
  
  console.log('Generating 26 weeks (6 months) of Sunday dates:');
  console.log('=========================================');
  
  let allSundays = true;
  
  for (let i = 0; i < 26; i++) {
    // Use the same logic as in Dashboard.tsx
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() - (i * 7));
    
    // Use local date formatting (same as Dashboard.tsx)
    const weekString = weekStart.getFullYear() + '-' + 
      String(weekStart.getMonth() + 1).padStart(2, '0') + '-' + 
      String(weekStart.getDate()).padStart(2, '0');
    
    const dayOfWeek = weekStart.getDay();
    const isSunday = dayOfWeek === 0;
    
    if (!isSunday) {
      allSundays = false;
    }
    
    console.log(`Week ${String(i + 1).padStart(2, ' ')}: ${weekString} (${weekStart.toDateString()}) - Day ${dayOfWeek} ${isSunday ? '✓' : '✗'}`);
  }
  
  console.log('\n=========================================');
  console.log(`Result: ${allSundays ? 'ALL DATES ARE SUNDAYS ✓' : 'SOME DATES ARE NOT SUNDAYS ✗'}`);
  
  if (allSundays) {
    console.log('✅ Date calculation is working correctly!');
  } else {
    console.log('❌ Date calculation needs to be fixed!');
  }
};

verifySundayDates();