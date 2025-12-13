const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/**
 * Mengecek apakah username valid (belum terdaftar)
 */
const isValid = (username) => {
  return !users.find(user => user.username === username);
};

/**
 * Mengecek apakah username & password cocok
 */
const authenticatedUser = (username, password) => {
  return users.find(
    user => user.username === username && user.password === password
  );
};

// Login (hanya user terdaftar)
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const user = authenticatedUser(username, password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT
  const accessToken = jwt.sign(
    { data: username },
    "access",
    { expiresIn: 60 * 60 }
  );

  // Simpan token di session
  req.session.authorization = {
    accessToken
  };

  return res.status(200).json({ message: "User successfully logged in" });
});

// Tambah / update review buku
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user; // dari middleware auth

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Pastikan reviews adalah object
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Simpan / update review berdasarkan username
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
