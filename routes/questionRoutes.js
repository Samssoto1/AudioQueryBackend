const express = require('express');

const router = express.Router();
const { createQuestion, createManyQuestions, saveQuizQuestions, getQuizQuestionsWithoutAnswer} = require('../controllers/questionsController')

router.post('/createQuestion', createQuestion)
router.post('/createManyQuestions', createManyQuestions)
router.post('/saveQuizQuestions', saveQuizQuestions) // batch...
router.get('/getQuizQuestionsWithoutAnswer/:quizId', getQuizQuestionsWithoutAnswer)

module.exports = router;