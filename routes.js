const express = require('express');
const router = express.Router();

router.use('/users', require('./routes/userRoutes.js'))
router.use('/quiz', require('./routes/quizRoutes.js'))
router.use('/questions', require('./routes/questionRoutes.js'))
router.use('/rooms', require('./routes/roomRoutes.js'))
router.use('/songs', require('./routes/songRoutes.js'))


module.exports = router;