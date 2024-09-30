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
    return res.status(200).json(books); // Implemented: return all books

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books.find(b => b.isbn === isbn);
    if (book) {
      return res.status(200).json(book); // Implemented: return book details
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    const authorBooks = books.filter(b => b.author === author);
    if (authorBooks.length > 0) {
      return res.status(200).json(authorBooks); // Implemented: return books by author
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;
  const titleBooks = books.filter(b => b.title === title);
  if (titleBooks.length > 0) {
    return res.status(200).json(titleBooks); // Implemented: return books by title
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  const book = books.find(b => b.isbn === isbn);
  if (book) {
    return res.status(200).json(book.reviews); // Implemented: return reviews for the book
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


public_users.get('/', async (req, res) => {
    try {
        // Example URL for fetching book data, adjust as necessary
        const response = await axios.get('https://api.example.com/books'); // Replace with your API
        return res.status(200).json(response.data); // Return all books
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book list." });
    }
});

//  Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        // Example URL for fetching book details based on ISBN
        const response = await axios.get(`https://api.example.com/books/isbn/${isbn}`); // Replace with your API
        if (response.data) {
            return res.status(200).json(response.data); // Return book details
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching book details." });
    }
});

//  Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        // Example URL for fetching books by author
        const response = await axios.get(`https://api.example.com/books/author/${author}`); // Replace with your API
        if (response.data.length > 0) {
            return res.status(200).json(response.data); // Return books by author
        } else {
            return res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by author." });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        // Example URL for fetching books by title
        const response = await axios.get(`https://api.example.com/books/title/${title}`); // Replace with your API
        if (response.data.length > 0) {
            return res.status(200).json(response.data); // Return books by title
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books by title." });
    }
});
module.exports.general = public_users;
