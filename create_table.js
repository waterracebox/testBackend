const { initDb } = require('./db');

initDb()
  .then(()=>{
    console.log('messages table ensured');
    process.exit(0);
  })
  .catch(err=>{
    console.error('init db error', err);
    process.exit(1);
  });
