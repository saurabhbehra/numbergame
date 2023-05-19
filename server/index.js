const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv=require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB setup
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
    console.log('Database connection successful');
})
.catch(err => {
    console.error('Database connection error'+err)
})

const gameSchema = new mongoose.Schema({
  sessionId: String,
  username: String,
  startTime: Number,
  numbers: [Number],
  timeTaken:Number,
  total:Number,
  goalAchieved: Boolean,
});

const Game = mongoose.model('Game', gameSchema);

// Start game route
app.post('/api/start', async (req, res) => {
  try {
    const { username } = req.body;
    const sessionId = generateSessionId();
    const startTime = Date.now();
    const numbers = generateRandomNumbers(8, 1001, 1999);
    console.log(numbers)
    const game = new Game({
      sessionId,
      username,
      startTime,
      numbers,
      goalAchieved: false,
    });
    await game.save();

    res.json({ sessionId, startTime, numbers });
  } catch (error) {
    console.error('Error starting the game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Finish game route
app.post('/api/finish', async (req, res) => {
  try {
    const { sessionId, timeTaken, numbers } = req.body;
    const game = await Game.findOne({ sessionId });
    if (!game) {
      return res.status(404).json({ error: 'Game session not found' });
    }

    const sum = numbers.reduce((a, b) => a + b, 0);
    const goalAchieved = sum >= 15600;

    game.goalAchieved = goalAchieved;
    game.timeTaken =timeTaken
    game.total = sum
    await game.save();

    res.json({ goalAchieved });
  } catch (error) {
    console.error('Error finishing the game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/random-numbers/:rightTable',async(req,res)=>{
  let rightTable = req.params.rightTable
  console.log(rightTable)
  const numbers = generateRandomNumbers(8, 1001, 1999,rightTable);
  res.json({ numbers })

})
// Helper function to generate a random session ID
const generateSessionId = () => {
  const length = 10;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let sessionId = '';

  for (let i = 0; i < length; i++) {
    sessionId += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return sessionId;
};

// Helper function to generate random numbers
const generateRandomNumbers = (count, min, max,exclude=[]) => {
  const numbers = [];
  while (numbers.length < count) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(randomNumber) && !exclude.includes(randomNumber)) {
      numbers.push(randomNumber);
    }
  }

  return numbers;
};


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
