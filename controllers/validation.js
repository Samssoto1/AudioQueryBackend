// User validation (Basic validation provided already provided in schema)

function createUserValidation(userData){ // Handles validation for email user format

    // Handle validation of email
    if(userData.email){
        if((/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(userData.email) == false)){ // Error if doesn't follow password
            return {status: "error", serverResponseMsg: "Invalid email format"};
        }
    }
    // Handle validation of username
    // Banned keywords, etc...

    // Handle validation of password
    if(userData.password){
        if((/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(userData.password) == false)){ // Error if doesn't follow password
            return {status: "error", serverResponseMsg: "Invalid password format"};
        }
    }

    return {status: "ok"};
}

function loginUserValidation(userData){ // Handles validation for login user format
    if(userData.email){
        if((/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(userData.password) == false)){ // Error if doesn't follow password
            return {status: "error", serverResponseMsg: "Invalid Username or Password"};
        }
    }

    if(userData.password){
        if((/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/.test(userData.password) == false)){ // Error if doesn't follow password
            return {status: "error", serverResponseMsg: "Invalid Username or Password"};
        }
    }

    return {status: "ok"};
}

module.exports = {
    createUserValidation,
    loginUserValidation
}