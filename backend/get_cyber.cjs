const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://college:college1@cluster0.y8so5pd.mongodb.net/college_erp?appName=Cluster0').then(async () => {
  const db = mongoose.connection;
  const atts = await db.collection('attendances').find({ subjectId: 'Cyber Security' }).toArray();
  console.log('CYBER ATTENDANCES:', atts);
  process.exit(0);
});
