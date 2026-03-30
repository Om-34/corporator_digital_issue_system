const bcrypt = require('bcryptjs'); // Changed from 'bcrypt'

const password = "janekbeatapoland@1935"; 
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error("Error hashing password:", err);
        return;
    }
    console.log("\n--- YOUR MASTER ADMIN HASH ---");
    console.log(hash); 
    console.log("-------------------------------\n");
});