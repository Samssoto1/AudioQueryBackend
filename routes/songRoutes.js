const express = require('express');

const router = express.Router();
const {getAll} = require ('../controllers/songController.js');

router.get('/getAll', getAll)

module.exports = router;
