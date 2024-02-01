const express = require('express');
const mongoose = require('mongoose');
const WebSocket = require('ws');

const app = express();

const port = 3000;
const server = app.listen(3000, () => console.log(`Server listening on port ${port}`));

const wss = new WebSocket.Server({ server });


mongoose.connect('mongodb+srv://nmoukthika14:1234@cluster0.6k5tphz.mongodb.net/void')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const QRDataSchema = new mongoose.Schema({
  // fields
  scanResult: {
    type: String, // Assuming scanResult is a string
    required: true, // Make it a required field
    unique: true, // Ensure each scanResult is unique in the database
  },
});
const QRData = mongoose.model('QRData', QRDataSchema);

// Handle WebSocket connections
wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const scanResult = data.scanResult;

      console.log('Received verification request for scanResult:', scanResult);

      // Attempt to find and delete in one operation:
      const result = await QRData.findOneAndDelete({ scanResult });

      console.log('Database query result:', result);
      //ws.send(JSON.stringify({ isPresent: true, message: 'Data verified and removed' }));
      ws.send(JSON.stringify({
        isPresent: !!result, // Indicate existence using boolean
        message: result ? 'Data verified and removed' : 'Data not found in database'
      }));
    } catch (error) {
      console.error('Verification error:', error);
      ws.send(JSON.stringify({ message: 'Error verifying data' }));
    }
  });
});

