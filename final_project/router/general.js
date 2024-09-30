const express = require('express');
const axios = require('axios'); // Import axios for HTTP requests

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {

    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {

        const doesExist = (username) => {
            // Filter the users array for any user with the same username
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
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books, null, 4));; // Implemented: return all books

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author; // Get the author from request parameters
    const results = []; // Array to hold books by the author

    // Iterate through the books object
    for (let key in books) {
        if (books[key].author.toLowerCase() === author.toLowerCase()) {
            results.push(books[key]); // Add the matching book to results
        }
    }

    // Check if any books were found by the author
    if (results.length > 0) {
        return res.send(results); // Send found books as a response
    } else {
        return res.send({ message: "No books found by this author" }); // Send not found message
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title; // Get the title from request parameters
    const results = []; // Array to hold books with the matching title

    // Iterate through the books object
    for (let key in books) {
        if (books[key].title.toLowerCase() === title.toLowerCase()) {
            results.push(books[key]); // Add the matching book to results
        }
    }

    // Check if any books were found with the given title
    if (results.length > 0) {
        return res.send(results); // Send found books as a response
    } else {
        return res.send({ message: "No books found with this title" }); // Send not found message
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn; // Get the book ID from request parameters

    // Check if the book exists
    const book = books[isbn];
    
    if (!book) {
        return res.send({ message: "Book not found" }); // Send not found message
    }

    // Check if the book has reviews
    if (!book.reviews || Object.keys(book.reviews).length === 0) {
        return res.send({ message: "No reviews found for this book" }); // Send no reviews message
    }

    // If reviews exist, send them in the response
    return res.send(book.reviews); // Send the reviews associated with the book
});


module.exports.general = public_users;
