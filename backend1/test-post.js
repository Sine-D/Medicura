import http from 'http';

const payload = JSON.stringify({
  fullName: 'Script Test',
  age: 35,
  email: 'scripttest@example.com',
  phone: '1112223333',
  gender: 'other',
  testType: 'CBC',
  labLocation: 'Main Lab',
  appointmentDate: '2025-10-15',
  preferredTime: '09:00 AM',
  terms: true,
  referenceNumber: 'LB000001'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/lab-appointments',
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
    try {
      console.log('Response:', JSON.parse(data));
    } catch (e) {
      console.log('Response (raw):', data);
    }
  });
});

req.on('error', (err) => {
  console.error('Request error:', err);
});

req.write(payload);
req.end();
