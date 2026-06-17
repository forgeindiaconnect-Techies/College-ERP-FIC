const mongoose = require('mongoose'); 
mongoose.connect('mongodb://localhost:27017/college_erp').then(async () => { 
  const db = mongoose.connection.db; 
  const staffs = await db.collection('staffs').find().toArray(); 
  for(const s of staffs) { 
    if(s.collegeId && s.email) { 
      await db.collection('users').updateOne({email: s.email}, {$set: {tenantId: s.collegeId}}); 
    } 
  } 
  const students = await db.collection('students').find().toArray(); 
  for(const s of students) { 
    if(s.collegeId && s.email) { 
      await db.collection('users').updateOne({email: s.email}, {$set: {tenantId: s.collegeId}}); 
    } 
  } 
  console.log('Migration complete'); 
  process.exit(0); 
});
