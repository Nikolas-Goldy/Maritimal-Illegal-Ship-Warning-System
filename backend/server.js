const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const User = require('/User.js');

app.post('/add-user', async (req, res) => {
  const { email, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ email, username, password: hashedPassword });

  user.save((err) => {
    if (err) return res.status(500).send(err);
    return res.status(200).send(user);
  });
});

// Endpoint to handle login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).send({ message: 'Login successful' });
    } else {
      res.status(401).send({ message: 'Email or password is incorrect' });
    }
  } catch (err) {
    res.status(500).send({ message: 'An error occurred while trying to log in' });
  }
});

// Endpoint to read CSV file
app.get('/read-csv', (req, res) => {
  const csvFilePath = path.join(__dirname, 'data', 'public-global-fishing-effort-v20231026.csv');
  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      res.status(200).json(results);
    })
    .on('error', (err) => {
      console.error('Error reading CSV file:', err);
      res.status(500).send({ message: 'An error occurred while reading the CSV file' });
    });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
