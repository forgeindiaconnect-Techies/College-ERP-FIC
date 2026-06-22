const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://college:college1@cluster0.y8so5pd.mongodb.net/college_erp?appName=Cluster0').then(async () => {
  const db = mongoose.connection;
  const user = await db.collection('users').findOne({ role: 'Staff', name: 'Mr.STAFF' });
  console.log('Mr.STAFF USER:', user);
  process.exit(0);
});
