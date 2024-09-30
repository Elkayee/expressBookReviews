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
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn; // Get the ISBN from request parameters
    const username = req.session.authorization.username; // Get the logged-in username from session

    let book = books[isbn];  // Retrieve book object associated with isbn
    if (book) {  // Check if the book exists
        const review = req.body.review; // Get the review from request body

        // Check if review is provided
        if (!review) {
            return res.status(400).send("Review text is required.");
        }

        // Initialize reviews array if it doesn't exist
        if (!book.reviews) {
            book.reviews = [];
        }

        // Flag to track if the user's review was updated
        let reviewUpdated = false;

        // Iterate through reviews to check if the user has already reviewed
        for (let i = 0; i < book.reviews.length; i++) {
            if (book.reviews[i].username === username) {
                // If review exists, update it
                book.reviews[i].review = review;
                reviewUpdated = true;
                break; // Exit the loop once the review is updated
            }
        }

        if (reviewUpdated) {
            res.send(`Review updated for the book with ISBN ${isbn}.`);
        } else {
            // If review doesn't exist, add a new review
            book.reviews.push({ username, review });
            res.send(`Review added for the book with ISBN ${isbn}.`);
        }
    } else {
        // Respond if the book with specified ISBN is not found
        res.send("Unable to find book!");
    }
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
