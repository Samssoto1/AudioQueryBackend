const questionSchema = require("../model/questionSchema.js")
const operation = require("../controllers/dbController.js");

const getQuizQuestions = operation.getQuizQuestions(questionSchema);
const deleteQuizQuestion = operation.deleteQuizQuestion(questionSchema)
const deleteAllQuizQuestions = operation.deleteAllQuizQuestions(questionSchema)
const getQuestionById = operation.getQuestionById(questionSchema);
const updateQuestionByQuestionId = operation.updateQuestionByQuestionId(questionSchema);
const createQuestion = operation.createOne(questionSchema);
const createManyQuestions = operation.createMany(questionSchema);

const saveQuizQuestions = operation.saveQuizQuestions(questionSchema);
const getQuizQuestionsWithoutAnswer = operation.getQuizQuestionsWithoutAnswer(questionSchema);

module.exports = {
    getQuizQuestions,
    createQuestion,
    deleteQuizQuestion,
    deleteAllQuizQuestions,
    getQuestionById,
    updateQuestionByQuestionId,
    createManyQuestions,
    saveQuizQuestions,
    getQuizQuestionsWithoutAnswer
}