const express = require('express');

const router = express.Router();
const { createQuiz, getQuizzesForUser, deleteQuiz, getQuizById, getSongById} = require ('../controllers/quizController');
const { getQuizQuestions, deleteQuizQuestion, deleteAllQuizQuestions, getQuestionById, updateQuestionByQuestionId} = require('../controllers/questionsController')

router.post('/create-a-quiz', createQuiz)
router.get('/view-quiz/:id')// currently unfinished
router.get('/quizzesForUser/:userId', getQuizzesForUser)
router.get('/getQuizQuestions/:quizId', getQuizQuestions)
router.get('/getQuestionById/:questionId', getQuestionById)
router.put('/updateQuestionByQuestionId', updateQuestionByQuestionId)
router.get('/getQuizById/:quizId', getQuizById)
router.delete('/delete/:quizId', deleteQuiz)


// MOVE THIS LATER (!IMPORTANT) shouldnt be in quiz routes. Api route could be changed for admin route.
router.get('/getSongById', getSongById)

router.delete('/deleteQuestion/:questionId', deleteQuizQuestion)
router.delete('/deleteAllQuizQuestions/:quizId', deleteAllQuizQuestions)

module.exports = router;
