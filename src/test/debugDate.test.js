// Debug the date issue
const debugDates = () => {
  console.log('Debugging date creation and parsing...\n');
  
  const today = new Date();
  console.log(`Today: ${today.toString()}`);
  console.log(`Today day of week: ${today.getDay()}`);
  console.log(`Today date only: ${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`);
  
  // Test creating Sunday manually
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay());
  console.log(`\nCalculated Sunday object: ${sunday.toString()}`);
  console.log(`Calculated Sunday day of week: ${sunday.getDay()}`);
  
  const sundayString = sunday.getFullYear() + '-' + 
    String(sunday.getMonth() + 1).padStart(2, '0') + '-' + 
    String(sunday.getDate()).padStart(2, '0');
  console.log(`Sunday string: ${sundayString}`);
  
  // Test parsing the string back
  const parsedSunday = new Date(sundayString);
  console.log(`\nParsed Sunday from string: ${parsedSunday.toString()}`);
  console.log(`Parsed Sunday day of week: ${parsedSunday.getDay()}`);
  
  // Test with explicit local parsing
  const [year, month, day] = sundayString.split('-').map(Number);
  const localSunday = new Date(year, month - 1, day);
  console.log(`\nLocal Sunday: ${localSunday.toString()}`);
  console.log(`Local Sunday day of week: ${localSunday.getDay()}`);
};

debugDates();