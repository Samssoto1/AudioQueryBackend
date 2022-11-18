const express = require('express');
const auth = require('../controllers/auth');

const router = express.Router();
const { getAUser, createUser, updateUser, deleteUser, loginUser, getAUserByUsername, forgotPassword, resetPassword } = require ('../controllers/userController');

router.get('/singleuser/:id', getAUser)
// router.get('/singleuserByUsername/:username', auth.verifyTokenAndReturnUser, getAUserByUsername)
router.get('/singleuserByUsername/:username', getAUserByUsername)
router.post('/login', loginUser)
router.post('/createuser', createUser)
router.put('/updateuser/:id', updateUser)
router.delete('/deleteuser/:id', deleteUser)

router.post('/forgotPassword/', forgotPassword)
router.post('/resetPassword/', resetPassword)

module.exports = router;
