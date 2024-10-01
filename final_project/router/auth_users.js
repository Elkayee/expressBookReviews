const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
let userswithsamename = users.filter((user) => {
    return user.username === username;
});
// Return true if any user with the same username is found, otherwise false
if (userswithsamename.length > 0) {
    return true;
} else {
    return false;
}

}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  // Extract username and password from the request body
  const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
// Add or update a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from request parameters
    const reviewText = req.body.review; // Extract review from request body

    // Check if review text is provided
    if (!reviewText) {
        return res.status(400).json({ message: "Review text is required." });
    }

    // Check if user is authenticated
    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not authenticated." });
    }

    const accessToken = req.session.authorization.accessToken; // Get access token from session

    try {
        // Verify token to extract the username
        const decoded = jwt.verify(accessToken, 'access');
        const username = decoded.data ? req.session.authorization.username : null;

        // Check if book exists
        if (books[isbn]) {
            // Update the review for the user
            books[isbn].reviews[username] = {
                reviewText: reviewText,
               
            };
            return res.status(200).json({ message: "Review added/updated successfully." });
        } else {
            return res.status(404).json({ message: "Book not found." });
        }
    } catch (error) {
        return res.status(401).json({ message: "Invalid token." });
    }
});


  // Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from request parameters

    // Check if the user is authenticated
    if (!req.session.authorization) {
        return res.status(403).json({ message: "User not authenticated." });
    }

    const username = req.session.authorization.username; // Get the username from the session

    // Check if the book exists
    if (books[isbn]) {
        // Check if the user has a review for this book
        if (books[isbn].reviews[username]) {
            // Delete the review for the user
            delete books[isbn].reviews[username];
            return res.status(200).json({ message: "Review deleted successfully." });
        } else {
            return res.status(404).json({ message: "No review found for this user." });
        }
    } else {
        return res.status(404).json({ message: "Book not found." });
    }
});

  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
