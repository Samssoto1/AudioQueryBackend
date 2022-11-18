const express = require('express');

const router = express.Router();
const { createRoom, deleteRoom, getRoom, editRoomUserList, getNicknamesInRoom } = require ('../controllers/roomController');

router.post('/createRoom', createRoom)
router.delete('/deleteRoom/:roomId', deleteRoom)
router.get('/getRoom/:roomId', getRoom)
router.put('/editRoomUserList', editRoomUserList)

module.exports = router;