const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Log all transfer requests for debugging
app.post('/api/transfers/request', (req, res, next) => {
  console.log('🔍 DEBUG: Transfer Request Received:');
  console.log('   Body:', JSON.stringify(req.body, null, 2));
  console.log('   Headers:', JSON.stringify(req.headers, null, 2));
  
  // Forward to actual backend
  const fetch = require('node-fetch');
  fetch('http://localhost:3001/api/transfers/request', {
    method: 'POST',
    headers: req.headers,
    body: JSON.stringify(req.body)
  })
  .then(response => response.json())
  .then(result => {
    console.log('📡 Backend Response:', result);
    res.json(result);
  })
  .catch(error => {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🔍 Debug proxy running on port ${PORT}`);
  console.log(`📡 Forwarding requests to http://localhost:3001`);
  console.log(`🎯 To test: Change frontend URL to http://localhost:3002`);
});
