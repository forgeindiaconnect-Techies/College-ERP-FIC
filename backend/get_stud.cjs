const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://college:college1@cluster0.y8so5pd.mongodb.net/college_erp?appName=Cluster0').then(async () => {
  const db = mongoose.connection;
  const user = await db.collection('students').findOne({ email: 'sarath@gmail.com' });
  console.log('SARATH STUDENT:', user);
  process.exit(0);
});
