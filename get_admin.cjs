const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://college:college1@cluster0.y8so5pd.mongodb.net/college_erp?appName=Cluster0').then(async () => {
  const users = mongoose.connection.collection('users');
  const admin = await users.findOne({ email: 'admin@college.edu' });
  console.log('Admin:', admin);
  process.exit(0);
});
