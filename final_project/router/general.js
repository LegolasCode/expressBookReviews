const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/**
 * POST /register
 * Mendaftarkan user baru
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!isValid(username, password)) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  if (users[username]) {
    return res.status(400).json({ message: "Username already exists" });
  }

  users[username] = { password };
  return res.status(201).json({ message: "User registered successfully" });
});

/**
 * GET /books
 * Mengambil seluruh daftar buku (Promise)
 */
public_users.get("/books", (req, res) => {
  new Promise((resolve) => {
    resolve(books);
  })
    .then((data) => res.status(200).json(data))
    .catch(() =>
      res.status(500).json({ message: "Failed to fetch books" })
    );
});

/**
 * GET /isbn/:isbn
 * Search by ISBN – Using Promises
 */
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  })
    .then((book) => res.status(200).json(book))
    .catch((err) =>
      res.status(404).json({ message: err })
    );
});

/**
 * GET /author/:author
 * Search by Author – Using Promises
 */
public_users.get("/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();

  new Promise((resolve, reject) => {
    const result = Object.values(books).filter(
      (book) => book.author.toLowerCase() === author
    );

    if (result.length > 0) {
      resolve(result);
    } else {
      reject("No books found for this author");
    }
  })
    .then((booksByAuthor) => res.status(200).json(booksByAuthor))
    .catch((err) =>
      res.status(404).json({ message: err })
    );
});

/**
 * GET /title/:title
 * Search by Title – Using Promises
 */
public_users.get("/title/:title", (req, res) => {
  const title = req.params.title.toLowerCase();

  new Promise((resolve, reject) => {
    const result = Object.values(books).filter(
      (book) => book.title.toLowerCase() === title
    );

    if (result.length > 0) {
      resolve(result);
    } else {
      reject("No books found with this title");
    }
  })
    .then((booksByTitle) => res.status(200).json(booksByTitle))
    .catch((err) =>
      res.status(404).json({ message: err })
    );
});

/**
 * GET /review/:isbn
 * Mengambil review buku
 */
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
