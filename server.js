// define port for server
const PORT = process.env.DEV_PORT || 8000

// an instance of the express server/package
const express = require('express');
const app = express()
const dotenv = require('dotenv').config();
const mongoose = require('./db/connection.js');
const bodyParser = require('body-parser');
const Cors = require('cors')

const server = require("http").createServer(app);
const io = require("socket.io")(server, {cors: {origin: "*", perMessageDeflate: false}});

// Socket Section

var rooms = new Map;

let clientNo = 0; // nums clients connected in general (via sockets)

// On Websocket connection
io.on('connection', socket => {
  clientNo++;
  console.log(clientNo);
  console.log(`New connection. Total # of sockets: ${clientNo} \n`);
  // console.log(io.sockets.adapter.rooms);

  socket.on('test', (data) => {
    console.log("test worked")
    console.log(clientNo)
    console.log(io.sockets.adapter.rooms);
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    clientNo--;
    console.log(`A user has disconnected. Total # of sockets: ${clientNo} \n`);
  })

///////////////////////////////////////////////////////* LOBBY METHODS *///////////////////////////////////////////////////////
  
  /* Used when a new user joins the lobby */
  socket.on('addUser', (data) => {

    if(!data.username){
      data.username = "";
    }

    if(rooms.has(data.socketId)){ // If the room exists then add the new user (nickname / score) to the lobby list
      let temp = rooms.get(data.socketId)
      let newUser = {nickname: data.nickname, username: data.username, answerChosen: "", answerCorrect: "", timeRemaining: undefined, score: 0}
      temp.nicknameList.push(newUser)
    }
    else{ // If the room doesn't exist (user is the host - makes a room to append others to in the map
      rooms.set(data.socketId, {scoreUpdateCount: 0, nicknameList: [{nickname: data.nickname, username: data.username, answerChosen: "", answerCorrect: "", timeRemaining: undefined, score: 0}]})
    }
  })

  /* Used when a new user leaves the lobby */
  socket.on('deleteUser', (data) => {
    if(rooms.has(data.socketId)){ // If room exists find the user, delete it from the lobby nickname list, and send the nickname list to client sockets
      let temp = rooms.get(data.socketId)
      temp.nicknameList.forEach((list, index)=>{
        if(list.nickname == data.nickname){
          console.log("deleting")
          temp.nicknameList.splice(index, 1);
          io.to(data.socketId).emit("deliverNicknameListToClient", rooms.get(data.socketId).nicknameList)
          return
        }
      })
    }
  })

  /* Sends lobby nickname list to all connected sockets on client */
  socket.on('getNicknamesInLobby', (socketId) => {
    console.log("Nicknames in lobby: ")
    console.log(rooms.get(socketId).nicknameList)
    console.log(rooms.get(socketId))
    console.log(socketId)
    io.to(socketId).emit("deliverNicknameListToClient", rooms.get(socketId).nicknameList);
  })

  /* Used when Host starts a lobby (provides hosts socket ID for session)*/
  socket.on('createLobby', () => {
    console.log("creatingLobby - sendingId")
    socket.emit("sendId", socket.id); // sends host ID to client
  })

  /* Used when user joins lobby through pin (not host) */
  socket.on('joinLobby', (object) => {
    try{
      socket.join(object.socketId);
      console.log('User has joined the lobby')
    }
    catch{
      console.log('Error... could not join room');
    }
  })
  
  // Used when starting the game
  socket.on('startGame', (object) => {
    console.log(object)
    io.to(object.socketId).emit("startGameConfirmed", object.quizQuestions);
  })

  ///////////////////////////////////////////////////////* GAME METHODS *///////////////////////////////////////////////////////

  // Used when a question is selected and an answer is needed.
  socket.on('getSelectedQuestionAnswer', (question) => {
    console.log(question)
    // io.to(object.socketId).emit("startGameConfirmed", object.quizQuestions);
  })

  // Used 
  socket.on('sendQuestionToClients', (data) => {
    console.log('receiveCurrentQ')
    console.log(data);
    io.to(data.socketId).emit('receiveCurrentQuestion', data.hostListOfQuestions);
  })

  // Answers 
  socket.on('answerChosen', async (data) => {
    console.log('allAnswersReceived')
    console.log(rooms);
    console.log(data.socketId);
    rooms.get(data.socketId).nicknameList
    console.log(rooms.get(data.socketId).nicknameList)
    let room = rooms.get(data.socketId);
    console.log(room.nicknameList)

    

    rooms.get(data.socketId).scoreUpdateCount += 1 
    
    room.nicknameList.forEach((user)=>{
      if(user.nickname == data.nickname){
        // Set answer
        user.answerChosen = data.answerChosen
        user.timeRemaining = data.timeRemaining
        return
      }
    })

    // IF scoreUpdateCount > length of users in the room
    if(room.scoreUpdateCount >= room.nicknameList.length){
      console.log("all ")
      console.log("updated nicknameList")
      console.log(room.scoreUpdateCount)
      console.log(room.nicknameList)
      console.log(room.nicknameList.length);
      console.log(room);
      console.log("updating nicknameList answer status")
      // Query DB for question answer
      const db = require('./controllers/dbController');

      let correctAnswer = await db.getQuestionAnswer(require("./model/questionSchema"), data.questionId);
      // forEach loop to change status of answer
      await rooms.get(data.socketId).nicknameList.forEach((user) =>{
        console.log("User: " + user.nickname)
        console.log("Answer: " + user.answerChosen)
        console.log(correctAnswer)
        if(user.answerChosen == correctAnswer){
          user.answerCorrect = true;
          // user.score += 10;
          console.log("time remaining")
          user.score =  Math.trunc(user.score + (100 * user.timeRemaining));
        }
        else{
          user.answerCorrect = false;
        }
      })

      // Emit scoreboard to client
      io.to(data.socketId).emit("allAnswersReceived", {roomData: rooms.get(data.socketId).nicknameList, correctAnswer: correctAnswer})
      
      // Reset values
      room.scoreUpdateCount = 0;


    }
  
    
  })

  // Quiz has ended
  socket.on('triggerEndOfQuiz', (socketId) => {
    // Get user
    let data = rooms.get(socketId).nicknameList
    
    
    data = data.sort((a,b) => b.score - a.score); // sort by highest score
    console.log(data);


    // Award points if user that won has an acc (has username)



    io.to(socketId).emit('onQuizEnd', data);
  })

  ///////////////////////////////////////////////////////* BOTH GAME & LOBBY METHODS *///////////////////////////////////////////
  socket.on('hostLeaving', (data) => {
    console.log("hostLeaving")
    console.log("hostLeaving")
    console.log("hostLeaving")
    console.log("hostLeaving")
  
    // Delete Pin from Rooms DB
    rooms.delete(data.socketId);
  
    // Emit to all sockets in room that host has left - game is ending
    io.to(data.socketId).emit("relayHostLeavingToListeners")
    console.log(rooms);
  })

})


const checkAuth = require("./middleware/check-auth");
const auth = require("./controllers/auth.js")



app.use(express.json())
app.use(Cors())

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  // Change * to individual client side later
  // res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
});

app.use(bodyParser.json())

// app.get('/admin', auth.verifyToken, (req, res) => {
//   res.status(200).json({message: "success"})
// })

app.get('/getNicknamesInRoom', (req, res, next) =>{
  // req.query.color1 === 'red'  // true
  // req.query.color2 === 'blue' // true
  // req.query.socketId;
  // req.query.nickname

  console.log("req socketId")
  console.log(req.query.socketId);

  console.log("req nn" );
  console.log(req.query.nickname)
  
  rooms.get(req.query.socketId).nicknameList.forEach((user) =>{
    console.log("user")
    console.log(user);

    if(req.query.nickname == user.nickname){
      // Nickname already exists in lobby
      res.send({"validity": "error: nickname already exists in lobby"})
    }
    else{
      res.send({"validity": "unique username"})
    }
  })
})

app.use('/api', require('./routes.js'))

server.listen(PORT, () => {
  console.log(`Server Connected on ${PORT}...`)
});

module.exports = app;

