// Test file to verify Sunday date calculations
const testSundayCalculation = () => {
  console.log('Testing Sunday date calculation logic...\n');
  
  const today = new Date('2025-08-22'); // Friday for testing
  console.log(`Today is: ${today.toDateString()} (${today.getDay()})`);
  console.log(`Day of week: ${today.getDay()} (0=Sunday, 1=Monday, etc.)\n`);
  
  console.log('Current logic: today.getDate() - today.getDay() - (i * 7)');
  for (let i = 0; i < 6; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() - (i * 7));
    console.log(`Week ${i}: ${weekStart.toDateString()} (${weekStart.getDay()}) - ${weekStart.toISOString().split('T')[0]}`);
  }
  
  console.log('\nCorrect logic: Find most recent Sunday, then go back i weeks');
  for (let i = 0; i < 6; i++) {
    const weekStart = new Date(today);
    const daysToSubtract = today.getDay() + (i * 7);
    weekStart.setDate(today.getDate() - daysToSubtract);
    console.log(`Week ${i}: ${weekStart.toDateString()} (${weekStart.getDay()}) - ${weekStart.toISOString().split('T')[0]}`);
  }
  
  console.log('\nAlternative logic: Set to this Sunday, then subtract weeks');
  for (let i = 0; i < 6; i++) {
    const thisWeekSunday = new Date(today);
    thisWeekSunday.setDate(today.getDate() - today.getDay());
    
    const weekStart = new Date(thisWeekSunday);
    weekStart.setDate(thisWeekSunday.getDate() - (i * 7));
    console.log(`Week ${i}: ${weekStart.toDateString()} (${weekStart.getDay()}) - ${weekStart.toISOString().split('T')[0]}`);
  }
};

testSundayCalculation();