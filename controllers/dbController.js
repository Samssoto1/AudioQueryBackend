//Initialize object that will have the operation functions.

const auth = require('./auth.js'); // Needed for hashing operations
const nodemailer = require("nodemailer"); // Needed for sending an email (Reset Password)
const validation = require('./validation');
const { default: mongoose } = require('mongoose');

operation = {};

// operation.saveQuizQuestions = function (schema) {
// 	return (req, res) => {
// 		console.log("data");
		
// 	}
// }

operation.saveQuizQuestions = function (schema) {

	return async (req, res) => {
		console.log("saveQuizQuestions")
		console.log(req.body);
		const session = await schema.startSession()
		session.startTransaction()
		try {
			// Handles multiple deletes upon save if necessary
			if (req.body.delete.length > 0) {
				await schema.deleteMany({ _id: req.body.delete }, { session: session })
			}
			// Handles multiple creates / inserts upon save if necessary
			if (req.body.create.length > 0) {
				await schema.insertMany(req.body.create, { session: session })
			}
			// Handles multiple edits / updates upon save if necessary
			if (req.body.edit.length > 0) {
				console.log("edit");
				console.log(req.body.edit)
				const updateQueries = [];

				req.body.edit.forEach((edit) => {
					updateQueries.push({
						updateOne: {
							filter: {_id: edit._id},
							update: { $set: {
								question: edit.body.question,
								answers: edit.body.answers,
								correctAnswer: edit.body.correctAnswer,
								questionTitle: edit.body.questionTitle,
								location: edit.body.location,
								songId: edit.body.songId, isValid: edit.body.isValid}}
						}})
				})
				await schema.bulkWrite(updateQueries, {session: session})
			}

			await session.commitTransaction();
			session.endSession();
			res.status(200).send();
		}
		catch (err) {
			console.log("aborting")
			console.log(err);
			await session.abortTransaction();
			session.endSession();
			res.status(500).send()
		}

	}
}

operation.getAll = function (schema) { // Get All data from a Schema
	return (req, res) => {
		schema.find((err, data) => {
			if (err) {
				res.status(500).send(err)
			} else {
				res.status(200).send(data);
			}
		});
	}
}

operation.createOne = function (schema) { // Create a basic (no additional processing required) item in db
	return async (req, res) => {
		const inputInfo = req.body;

		schema.create(inputInfo, (err, data) => {
			if (err) {
				res.status(500).send(err)
			} else {
				res.status(201).send(data);
			}
		})
	}
}

operation.createMany = function (schema) {
	return async (req, res) => {
		const inputInfo = req.body;

		schema.insertMany(inputInfo, (err, data) => {
			if (err) {
				res.status(500).send(err)
			} else {
				res.status(201).send(data);
			}
		})
	}
}

operation.getUserByUsername = function (schema) {
	return async (req, res) => {
		schema.find({username: req.params.username}, function (err, docs) {
			console.log(req.params.username);
			console.log(docs);
			if (err) {
				res.status(400).send(err)
			}
			else {
				if (docs === null) {
					res.status(200).send("No such user")
				}
				else {
					res.status(200).json(docs)
				}
			}
		});
	}
}

operation.toGet = function (schema) { // Get one specific Item in the database
	return async (req, res) => {
		schema.findById(req.params.id, function (err, docs) {
			if (err) {
				res.status(400).send(err)
			}
			else {
				if (docs === null) {
					res.status(200).send("No such Item")
				}
				else {
					res.status(200).json(docs)
				}
			}
		});
	}
}

operation.toUpdate = function (schema) { //Update one specific item in the database
	return async (req, res) => {
		const id = req.params.id;
		schema.findByIdAndUpdate(req.params.id, req.body, function (err, docs) {
			if (err) {
				res.status(400).send(err)
			}
			else {
				res.status(200).json(docs)
			}
		});
	}
}

operation.toDelete = function (schema) { // Delete a specific item in the database
	return async (req, res) => {
		schema.findByIdAndDelete(req.params.id, function (err, docs) {
			if (err) {
				res.status(400).send("You have error")
			}
			else {
				if (docs === null) {
					res.status(200).send("Already Deleted")
				}
				else {
					res.status(200).send(docs)
					console.log("Deleted : ", docs);
				}
			}
		});
	}
}

// User Methods

operation.createUser = function (schema) { // Create an object in the database
	return async (req, res) => {
		let {username, email, password} = req.body; // store register form input values

		// Handle format validation here
		let userValidation = validation.createUserValidation({username, email, password});

		if(userValidation.status != "ok"){ // If format validation fails respond with errors
			return res.status(400).json({status: userValidation.status, serverResponseMsg: userValidation.serverResponseMsg})
		}

		// Check if user or email is used in db

		const infoByUser = await schema.findOne({ username }).lean() // checking to see if inputted username pulls any data from db
		const infoByEmail = await schema.findOne({ email }).lean() // checking to see if inputted email pulls any data from db

		if(infoByUser){ // validation to see if username already exists in db
			return res.status(200).json({status: "ok", serverResponseMsg: "This username has already been used. Please use a new username and try again."})
		}

		if(infoByEmail){ // validation to see if email already exists in db
			return res.status(200).json({status: "ok", serverResponseMsg: "This email has already been used. Please use a new email and try again."})
		}

		password = await auth.hashPassword(password); // hash password

		schema.create({username, email, password}, (err, data) => {
			if (err) {
				return res.status(500).json({status: 'failed', serverResponseMsg: "The server was unable to create an account. Please contact administrators regarding this issue"});
			} else {
				res.status(201).json({status:'success'})
			}
		})
	}
}

// User Auth Methods

operation.loginUser = function (schema) { // Login a user
	return async (req, res) => {
		const {email, password} = req.body; // store login from form inputs

		// Handle format validation here

		let userValidation = validation.loginUserValidation({email, password});

		if(userValidation.status != "ok"){ // If format validation fails respond with errors
			return res.status(200).json({status: userValidation.status, serverResponseMsg: userValidation.serverResponseMsg})
		}

		const user = await schema.findOne({ email }).lean() // look for matching email in db to pull up user data

		if(!user){ 	// If user doesn't exist in database... return error
			return res.json({status: 'error', serverResponseMsg: "Couldn't find your Audio Query account."})
		}

		// Hash user provided password from input and compare with hash from db
		if (await auth.compareHash(password, user.password) == false){ // Hash password provided in form input against hashed password in database
			return res.status(200).json({status: 'error', serverResponseMsg: "Invalid Username or Password"})
		}
		
		// If this code has been reached... user has an account and has correctly provided their information.

		const token = auth.jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '10m' }) //Provides their JWT
		
		// let headers = new Headers({ 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + this.token });

		return res.status(200).json({
			success: true,
			token: token,
			// expiresIn: 600, // this is 10m in seconds
			expiresIn: 3600,
			user:{
				id: user._id,
				username: user.username
			}
		})
	}
}

operation.forgotPassword = function (schema) { // Emails user a reset password link
	return async (req, res) => {
		const {email} = req.body; // Store form data
		
		const user = await schema.findOne({ email }).lean() // grab that users(email) data from the database
		console.log(user);

		// validation to see if username / email exists in db
		if(!user){
			return res.status(422).json({standing: 'error', message: 'No user was found to exist with this email. Please confirm the spelling and try again.'})
		}
		
		const token = auth.jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET2, { expiresIn: '10m' })
		const link = `http://localhost:4200/resetPassword/${user._id}/${token}`;

		// res.send('Password reset link has been sent to your email...'); 
		
		// (Using NodeMailer to send emails ......... (Send Grid or Gmail API can be future options... currently using Nodemailer)
		// let testAccount = await nodemailer.createTestAccount();
		console.log(process.env.SONG_SLEUTH_EMAILER, " ", process.env.SONG_SLUETH_APP_PASS)
		let transporter = nodemailer.createTransport({
			service: "gmail",
			// host: "smtp.ethereal.email",
			// port: 587,
			// secure: false, //true for 465, false for other ports
			auth: {
				// user: testAccount.user,
				// pass: testAccount.pass
				user: process.env.SONG_SLEUTH_EMAILER,
				pass: process.env.SONG_SLUETH_APP_PASS
			},
			tls: {
				rejectUnauthorized: false
			}
		});

		console.log(email);

		// email: SongSleuthEmailer@gmail.com
		// pass: Pqwk4hjgi0oqijnew!s

		// send the mail
			let info = await transporter.sendMail({
			from: 'SongSleuthEmailer@gmail.com',
			to: email,
			subject: "Reset Password",
			// text: + link,
			html: `<p>You are receiving this email for attempting to reset your password. If this isn't you, you can safely ignore this. Otherwise, click the link below:</p><a href="${link}">Reset Password</a>`
			});

			console.log("Message sent", info.messageId);
			// console.log("Preview", nodemailer.getTestMessageUrl(info));



		console.log('email should have sent?')


		return res.status(200).json({
			standing: 'valid',
			message: `A password reset form has been successfully emailed to: ${email}`,
			token: token,
			expiresIn: 600, // this is 10m in seconds
			link: link
		})
	}
}

operation.resetPassword = function (schema) { // Handles resetting a password
	return async (req, res) => {
		let {userId, password, resetPasswordToken} = req.body;
		console.log(userId);
		console.log(password);
		console.log(resetPasswordToken);

		// try{
			// const payload = auth.verify(resetPasswordToken, process.env.JWT_SECRET2)
			password = await auth.hashPassword(password);
			schema.findByIdAndUpdate(userId, {password: password}, function (err, docs) {
				if (err) {
					res.status(400).send(err)
					console.log('error resetting')
				}
				else {
					res.status(200).json({standing: "valid", message: "Your password has been sucessfully reset."})
					console.log('reset successful')
				}
			});
			// change password
			
		// }
		// catch{
		// 	console.log('error verifying payload');
		// }
	}
}

/// Quiz Methods

operation.createQuiz = function (schema) {
	return async (req, res) => {
		const quizInfo = req.body;

		schema.create(quizInfo, (err, data) => {
			if (err) {
				res.status(500).send(err)
			} else {
				res.status(201).send(data);
			}
		})
	}
}

operation.getQuizzesForUser = function (schema) {
	return async (req, res) => {
		schema.find({authorId: req.params.userId}, function (err, docs) {
			if (err) {
				res.status(400).send(err)
			}
			else {
				console.log(req.params.userId);
				console.log('quiz info for user')
				console.log(docs);
				if (docs === null) {	
					res.status(200).send("No such Item")
				}
				else {
					res.status(200).json(docs)
				}
			}
		});
	}
}

operation.deleteQuiz = function (schema) {
	return async (req, res) => {
		console.log('deleting quiz')
		schema.findByIdAndDelete(req.params.quizId, function (err, docs) {
			if (err) {
				res.status(400).send("You have error")
			}
			else {
				if (docs === null) {
					res.status(200).send("Already Deleted")
				}
				else {
					res.status(200).send(docs)
					console.log("Deleted : ", docs);
				}
			}
		});
	}
}

operation.getQuizQuestions = function (schema) {	
	return async (req, res) => {
		schema.find({quizId: req.params.quizId}, function (err, docs) {
			if (err) {
				res.status(400).send(err)
			}
			else {
				if (docs === null) {	
					res.status(200).send("No such Item")
				}
				else {
					res.status(200).json(docs)
				}
			}
		});
	}
}

// MyModel.find({name: "john" }, 'name age address', function(err, docs) {
//     console.log(docs);
// });

operation.getQuizQuestionsWithoutAnswer = function (schema) {	
	return async (req, res) => {
		schema.find({quizId: req.params.quizId}, 'question answers quizId songId location').populate("songId", 'audioFile').sort({"location": 1}).then(p => res.status(200).send(p));
		/*
		schema.find({quizId: req.params.quizId}, 'questionTitle answers quizId songId location', function (err, docs) {
			if (err) {
				console.log(err)
				res.status(400).send(err)
			}
			else {
				if (docs === null) {	
					res.status(200).send("No such Item")
				}
				else {
					console.log(docs);
					res.status(200).json(docs)
				}
			}
		})
		*/
	}
}

operation.getQuestionAnswer = async function (schema, questionId) {	
	console.log('qwer')
	let res = await schema.findOne({_id: questionId}, 'correctAnswer answers');
	console.log(res.correctAnswer);
	let correctAnswer = res.correctAnswer - 1
	let answers = res.answers;
	console.log(correctAnswer);
	console.log(answers)
	return (res.answers[correctAnswer])
}

operation.deleteQuizQuestion = function (schema) {
	return async (req, res) => {
		schema.findByIdAndDelete(req.params.questionId, function (err, docs) {
			if (err) {
				res.status(400).send("You have error")
			}
			else {
				if (docs === null) {
					res.status(200).send("Already Deleted")
				}
				else {
					res.status(200).send(docs)
					console.log("Deleted : ", docs);
				}
			}
		});
	}
}

operation.deleteAllQuizQuestions = function (schema) {
	return async (req, res) => {
		console.log('deleting quiz QUESTIONS')
		schema.deleteMany({quizId: req.params.quizId}, function (err, docs) {
			if (err) {
				res.status(400).send("You have error")
			}
			else {
				if (docs === null) {
					res.status(200).send("Already Deleted")
				}
				else {
					res.status(200).send(docs)
					console.log("Deleted : ", docs);
				}
			}
		});
	}
}

operation.getQuizById = function (schema) {
	return async (req, res) => {
		schema.findById(req.params.quizId, function (err, docs) {
			if (err) {
				res.status(400).send(err)
			}
			else {
				if (docs === null) {
					res.status(200).send("No such Item")
				}
				else {
					res.status(200).json(docs)
				}
			}
		});
	}
}

operation.getQuestionById = function (schema) {
	return async (req, res) => {
		schema.findById(req.params.questionId, function (err, docs) {
			if (err) {
				res.status(400).send(err)
			}
			else {
				if (docs === null) {
					res.status(200).send("No such Item")
				}
				else {
					res.status(200).json(docs)
				}
			}
		});
	}
}

operation.updateQuestionByQuestionId = function (schema) {
	return async (req, res) => {
		let {answerOne, answerTwo, answerThree, answerFour, correctAnswer, songId, songTitle, questionId} = req.body;

		schema.findByIdAndUpdate(questionId, {answerOne: answerOne, answerTwo: answerTwo, answerThree: answerThree, answerFour: answerFour, correctAnswer: correctAnswer, songId: songId, songTitle: songTitle}, function (err, docs) {
			if (err) {
				res.status(400).send(err)
			}
			else {
				if (docs === null) {
					res.status(200).send("No such Item")
					console.log('here')
				}
				else {
					res.status(201).json(docs)
				}
			}
		});
	}
}

// Song Methods 

operation.getSongById = function (schema) {
	return async (req, res) => {
		schema.findById(req.params.songId, function (err, docs) {
			if (err) {
				res.status(400).send(err)
			}
			else {
				if (docs === null) {
					res.status(200).send("No such Item")
				}
				else {
					res.status(200).json(docs)
				}
			}
		});
	}
}

// Create an object in the database
operation.createRoom = function (schema) {
	return async (req, res) => {
		const roomInfo = req.body;

		schema.create(roomInfo, (err, data) => {
			if (err) {
				res.status(500).send(err)
			} else {
				res.status(201).send(data._id);
			}
		})
	}
}

// Create an object in the database
operation.getRoom = function (schema) {
	return async (req, res) => {
		const roomId = req.params.roomId;

		schema.findById(roomId, null, (err, data) => {
			if (err) {
				res.status(500).send(err)
			} else {
				res.status(201).send(data);
			}
		})
	}
}

// Create an object in the database
operation.editRoomUserList = function (schema) {
	return async (req, res) => {
		let {roomId, user, operation} = req.body;

		console.log(req.body);

		if(operation == "add"){
			schema.findByIdAndUpdate(roomId, {$push: {users: user}}, function (err) {
				if (err) {
					res.status(400).json({serverResponseMsg: "failed to update user list"})
				}
				else {
					res.status(200).json({serverResponseMsg: "success"})
				}
			});
		}
		else{
			// Delete
			if(operation == "delete"){
				console.log("deleting user from room")
				schema.findByIdAndUpdate(roomId, {$pull: {users: user}}, function (err, docs) {
					if (err) {
						res.status(400).json({serverResponseMsg: "failed to update user list"})
					}
					else {
						res.status(200).json({serverResponseMsg: "success"})
					}
				});
				return
			}
		}
	}
}

operation.deleteRoom = function (schema) {
	return async (req, res) => {
		console.log('deleting room')
		schema.findByIdAndDelete(req.params.roomId, function (err, docs) {
			if (err) {
				res.status(400).send("You have error")
			}
			else {
				if (docs === null) {
					res.status(200).send("Already Deleted")
				}
				else {
					res.status(200).send(docs)
					console.log("Deleted : ", docs);
				}
			}
		});
	}
}

module.exports = operation;