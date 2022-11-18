const mongoose = require('mongoose')

const quizSchema = mongoose.Schema({
  title: {type: String}, // needs to have unique active for two conditions. Unique for title, and user.
  description: {type: String},
  authorId: {type: String},
  questionOrderType: {enum: ['ordered', 'random']},
  isValid: {type: Boolean, default: false}
})

const quizDb = mongoose.model('quiz', quizSchema)
module.exports = quizDb
