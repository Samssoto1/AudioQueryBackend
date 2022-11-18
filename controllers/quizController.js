const quizSchema = require("../model/quizSchema.js")
const operation = require("../controllers/dbController.js");

const createQuiz = operation.createQuiz(quizSchema);
const getQuizzesForUser = operation.getQuizzesForUser(quizSchema);
const deleteQuiz = operation.deleteQuiz(quizSchema);
const getQuizQuestions = operation.getQuizQuestions(quizSchema);
const getQuizById = operation.getQuizById(quizSchema);

const songSchema = require("../model/songSchema"); // move this later

const getSongById = operation.getSongById(songSchema);

module.exports = {
    createQuiz,
    getQuizzesForUser,
    deleteQuiz,
    getQuizQuestions,
    getSongById,
    getQuizById
}