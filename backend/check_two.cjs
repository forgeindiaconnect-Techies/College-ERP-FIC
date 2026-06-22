const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://college:college1@cluster0.y8so5pd.mongodb.net/college_erp?appName=Cluster0').then(async () => {
  const db = mongoose.connection;
  const atts = await db.collection('attendances').find({ studentId: 'IT2026-001' }).toArray();
  console.log('ATTENDANCES COUNT:', atts.length);
  console.log(atts.map(a => a.subjectId + ' - ' + a.status + ' - ' + a.periodId));
  process.exit(0);
});
