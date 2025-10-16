import http from 'http';

const payload = JSON.stringify({
  firstName: 'API Test',
  lastName: 'User',
  email: 'apitest@example.com',
  phoneNumber: '1234567890',
  dateOfBirth: '1990-01-01',
  gender: 'male',
  preferredDate: '2025-10-20',
  preferredTime: 'morning',
  testType: 'CBC',
  contactPreference: ['Email']
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/patient-forms',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try { console.log('Response:', JSON.parse(data)); } catch (e) { console.log('Response (raw):', data); }
  });
});

req.on('error', (err) => { console.error('Request error:', err); });

req.write(payload);
req.end();
