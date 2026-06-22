const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const User = require('./backend/models/User.js').default;
    const bcrypt = require('bcryptjs');
    
    const user = await User.findOne({ email: 'admin@college.edu' });
    console.log('User found:', user ? user.email : 'No');
    
    if (user) {
      const match = await bcrypt.compare('password123', user.password);
      console.log('Password match:', match);
      console.log('Hash in DB:', user.password);
    }
    
    process.exit(0);
  });

