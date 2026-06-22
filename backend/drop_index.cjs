const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://college:college1@cluster0.y8so5pd.mongodb.net/college_erp?appName=Cluster0').then(async () => {
  const db = mongoose.connection;
  try {
    await db.collection('timetables').dropIndex('department_1_semester_1');
    console.log('Old index dropped successfully!');
  } catch (err) {
    console.log('Error dropping index (maybe it doesnt exist?):', err.message);
  }
  process.exit(0);
});
