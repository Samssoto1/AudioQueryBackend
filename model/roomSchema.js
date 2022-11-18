const mongoose = require('mongoose')

const roomSchema = mongoose.Schema({
    quizId: {type: String},
    socketId: {type: String},
    users: []
})

const roomDb = mongoose.model('room', roomSchema)
module.exports = roomDb