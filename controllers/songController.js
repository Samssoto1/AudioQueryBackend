const songSchema = require("../model/songSchema.js")
const operation = require("../controllers/dbController.js");

// Gets an individual user
const getAll = operation.getAll(songSchema); // Gets all 

module.exports = {
    getAll
}
