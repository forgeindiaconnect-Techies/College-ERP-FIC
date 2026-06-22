const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://college:college1@cluster0.y8so5pd.mongodb.net/college_erp?appName=Cluster0').then(async () => {
  const db = mongoose.connection;
  const s = await db.collection('students').findOne({ id: 'IT2026-001' });
  console.log('STUDENT:', s);
  process.exit(0);
});
