const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
dotenv.config({ path: './.env' });

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const User = require('./models/User.js').default;
    const user = await User.findOne({ email: 'admin@college.edu' });
    const match = await bcrypt.compare('password123', user.password);
    console.log('Password match:', match);
    process.exit(0);
  });

