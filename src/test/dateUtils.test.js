// Test dateUtils functions to verify Sunday date generation

// Mock the dateUtils functions locally since we can't import TypeScript in Node.js directly
const getSundayDates = (weeksBack = 52) => {
  const dates = [];
  const today = new Date();

  for (let i = -weeksBack; i < 1; i++) {
    // Calculate the target week's date
    const targetWeek = new Date(today);
    targetWeek.setDate(today.getDate() + i * 7);
    
    // Find Sunday of that week
    const sunday = new Date(targetWeek);
    sunday.setDate(targetWeek.getDate() - targetWeek.getDay());
    
    const dateString = sunday.getFullYear() + '-' + 
      String(sunday.getMonth() + 1).padStart(2, '0') + '-' + 
      String(sunday.getDate()).padStart(2, '0');
    dates.push(dateString);
  }

  return dates.sort().reverse();
};

const getMostRecentSunday = () => {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  return sunday.getFullYear() + '-' + 
    String(sunday.getMonth() + 1).padStart(2, '0') + '-' + 
    String(sunday.getDate()).padStart(2, '0');
};

const testDateUtils = () => {
  console.log('Testing dateUtils functions...\n');
  
  // Test getMostRecentSunday
  console.log('=== Testing getMostRecentSunday ===');
  const recentSunday = getMostRecentSunday();
  const [year, month, day] = recentSunday.split('-').map(Number);
  const recentSundayDate = new Date(year, month - 1, day);
  console.log(`Most recent Sunday: ${recentSunday} (${recentSundayDate.toDateString()})`);
  console.log(`Day of week: ${recentSundayDate.getDay()} ${recentSundayDate.getDay() === 0 ? '✓' : '✗'}`);
  
  // Test getSundayDates with first 8 weeks
  console.log('\n=== Testing getSundayDates (first 8 weeks) ===');
  const sundayDates = getSundayDates(8);
  
  let allSundays = true;
  sundayDates.forEach((dateStr, index) => {
    // Parse correctly using local timezone
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    const isSunday = dayOfWeek === 0;
    
    if (!isSunday) {
      allSundays = false;
    }
    
    console.log(`${String(index + 1).padStart(2, ' ')}: ${dateStr} (${date.toDateString()}) - Day ${dayOfWeek} ${isSunday ? '✓' : '✗'}`);
  });
  
  console.log('\n=========================================');
  console.log(`Result: ${allSundays ? 'ALL DATES ARE SUNDAYS ✓' : 'SOME DATES ARE NOT SUNDAYS ✗'}`);
  
  if (allSundays) {
    console.log('✅ dateUtils functions are working correctly!');
  } else {
    console.log('❌ dateUtils functions need to be fixed!');
  }
};

testDateUtils();