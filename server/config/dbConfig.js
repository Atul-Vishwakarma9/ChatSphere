const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://ChatSphere-user:vk27zsIkq4E1I69s@cluster0.8qvs77w.mongodb.net/ChatSphere')
  .then(() => console.log('✅ DB Connected'))
  .catch((err) => console.error('❌ DB Error:', err.message));

module.exports = mongoose.connection;