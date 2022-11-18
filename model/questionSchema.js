const mongoose = require('mongoose')
const songId = require("./songSchema")

const questionSchema = mongoose.Schema({
  question: {type: String},
  questionTitle: {type: String},
  answers: {type: Array},
  correctAnswer: {type: Number},
  quizId: {type: String},
  songId: {type: String, ref: songId},
  location: {type: Number},
  isValid: {type: Boolean}
})

const questionDb = mongoose.model('question', questionSchema)
module.exports = questionDb