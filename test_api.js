import axios from 'axios';

async function test() {
  try {
    // 1. Add staff
    console.log('Adding staff...');
    const res = await axios.post('http://localhost:5000/api/staff', {
      id: `STF999`,
      name: 'Test Staff',
      email: 'test@college.edu',
      dept: 'Computer Science'
    }, {
      headers: { Authorization: 'Bearer mock-admin' }
    });
    console.log('Added:', res.data.name);

    // 2. Fetch staff
    console.log('Fetching staff...');
    const fetchRes = await axios.get('http://localhost:5000/api/staff', {
      headers: { Authorization: 'Bearer mock-admin' }
    });
    const found = fetchRes.data.find(s => s.id === 'STF999');
    console.log('Found in DB:', !!found);
    
  } catch (e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
