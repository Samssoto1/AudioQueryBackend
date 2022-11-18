const roomSchema = require("../model/roomSchema.js")
const operation = require("../controllers/dbController.js");

const createRoom = operation.createRoom(roomSchema);
const deleteRoom = operation.deleteRoom(roomSchema);
const getRoom = operation.getRoom(roomSchema);
const editRoomUserList = operation.editRoomUserList(roomSchema);

module.exports = {
    createRoom,
    deleteRoom,
    getRoom,
    editRoomUserList
}