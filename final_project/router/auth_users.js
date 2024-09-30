const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  return users.some(user => user.username === username);

}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  return users.some(user => user.username === username && user.password === password);

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
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Extract the ISBN from the request parameters
    const isbn = req.params.isbn;
    // Extract the review from the request body
    const { review, username } = req.body;
  
    // Check if the book exists
    const book = books.find(b => b.isbn === isbn);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Initialize reviews array if it doesn't exist
    if (!book.reviews) {
      book.reviews = [];
    }
  
    // Add the review to the book's reviews array
    book.reviews.push({ username, review });
    
    return res.status(200).json({ message: "Review added successfully", reviews: book.reviews });
  });


  // Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Extract the ISBN from the request parameters
    const isbn = req.params.isbn;
    // Extract the username from the request (assume it is set in the token)
    const { username } = req.body;
  
    // Check if the book exists
    const book = books.find(b => b.isbn === isbn);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if the reviews array exists
    if (!book.reviews || book.reviews.length === 0) {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
  
    // Filter out the review that belongs to the current user
    const initialReviewCount = book.reviews.length;
    book.reviews = book.reviews.filter(review => review.username !== username);
  
    // Check if a review was deleted
    if (book.reviews.length === initialReviewCount) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }
  
    return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
  });
  
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
