const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

let users = [];
let nextUserId = 1;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create a new user
app.post('/api/users', (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const newUser = {
    username,
    _id: nextUserId.toString(),
  };
  nextUserId++;
  users.push(newUser);

  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercise to a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find((u) => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newExercise = {
    description,
    duration: parseInt(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString(),
  };

  user.log = user.log || [];
  user.log.push(newExercise);

  res.json({
    _id: user._id,
    username: user.username,
    description: newExercise.description,
    duration: newExercise.duration,
    date: newExercise.date,
  });
});

// Get exercise log of a user
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const user = users.find((u) => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { from, to, limit } = req.query;
  let log = user.log || [];

  if (from) {
    const fromDate = new Date(from);
    log = log.filter((exercise) => new Date(exercise.date) >= fromDate);
  }

  if (to) {
    const toDate = new Date(to);
    log = log.filter((exercise) => new Date(exercise.date) <= toDate);
  }

  if (limit) {
    log = log.slice(0, parseInt(limit));
  }

  const logCount = log.length;

  res.json({
    _id: user._id,
    username: user.username,
    count: logCount,
    log,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
