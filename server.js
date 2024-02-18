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
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  events: [{ type: String }]
});
const QRData = mongoose.model('QRData', QRDataSchema);
const user = mongoose.model("logins" , userSchema)

// Handle WebSocket connections
wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const scanResult = data.scanResult;

      console.log('Received verification request for scanResult:', scanResult);
      var event = "vr"
      // Attempt to find and delete in one operation:
      const result = await user.findOne({ scanResult });

      if (result) { 

        // Using indexOf to find the index of the event to remove
        const indexToRemove = result.events.lastindexOf(event);

        if (indexToRemove) {
          // Using splice to remove the first occurrence of the element
          result.events.splice(indexToRemove, 1);

          // Using updateOne to update the user in the database
          await user.updateOne({ scanResult }, { $set: { events: result.events } });

          console.log(`One occurrence of event "${eventToRemove}" removed successfully.`);
        } else {
          console.log(`Event "${eventToRemove}" not found in the events array.`);
        }
      } else {
        console.log("User not found.");
      }

    
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

function countFrequency(arr) {
  const frequency = {};

  // Loop through the array
  for (let i = 0; i < arr.length; i++) {
    const currentItem = arr[i];

    // Check if the item is already in the frequency object
    if (frequency[currentItem] === undefined) {
      // If not, initialize the count to 1
      frequency[currentItem] = 1;
    } else {
      // If yes, increment the count
      frequency[currentItem]++;
    }
  }

  // Display the frequency of each item
  let result = [];
  for (const item in frequency) {
    result.push(`${item}: ${frequency[item]} tickets`);
  }
  console.log(result)
  return result;
}