const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const User = require('./models/User.js').default;
    const users = await User.find({}, 'name email role');
    console.log(users);
    process.exit(0);
  });

