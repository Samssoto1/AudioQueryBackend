const bcrypt = require('bcrypt'); // needed for password hashing / login auth 
const jwt = require('jsonwebtoken');

async function hashPassword(password){
    /* Password Hashing */
        const salt = await bcrypt.genSalt(10); // Generate a 10 character string (salt)
        
        const hashedPassword = await bcrypt.hash(password, salt); // hash the password
        
        return hashedPassword;
}

async function compareHash(typedPassword, hashedPassword){
    return await bcrypt.compare(typedPassword, hashedPassword)
    // Example of how this would be run: (await auth.compareHash("qwerqwerqwerqwer", userInfo.password)
}

function verifyToken(req, res, next){
    try{
        console.log(req.headers.authorization.split(" ")[1])
        // split white space and get token
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET);
        next();
        
    }
    catch (error) {
        console.log('here4123')
        res.status(401).json({message: "Auth failed!"});
    }
}

function verifyTokenAndReturnUser(req, res, next){
    try{
        console.log(req.headers.authorization.split(" ")[1])
        // split white space and get token
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, function(err, decodedToken){
            console.log(decodedToken);
            console.log(decodedToken.id);
            let userData = {userId: decodedToken.id, username: decodedToken.username};
            return userData;
        });
        next();
        
    }
    catch (error) {
        console.log('here4123')
        console.log(error);
        res.status(401).json({message: "Auth failed!"});
    }
}

module.exports = {
    hashPassword,
    compareHash,
    jwt,
    verifyToken,
    verifyTokenAndReturnUser
};