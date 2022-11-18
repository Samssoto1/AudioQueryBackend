const jwt= require('jsonwebtoken');

module.exports = (req, res, next) => {
    try{
        console.log(req.headers.authorization.split(" ")[1])
        // split white space and get token
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET);
        next();
        
    }
    catch (error) {
        res.status(401).json({message: "Auth failed!"});
    }

};