const mongoose = require('mongoose');
mongoose.connect(process.env.DEV_DB_STRING)
module.exports = mongoose;