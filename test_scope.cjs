
try {
  const bulkRecords = [1, 2, 3];
  throw new Error('API failed');
} catch (err) {
  try {
    const combined = [...bulkRecords];
  } catch (e) {
    console.log('Error caught:', e.message);
  }
}

