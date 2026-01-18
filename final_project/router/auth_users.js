const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/**
 * Mengecek apakah username valid (belum terdaftar)
 */
const isValid = (username) => {
  return !users.find((user) => user.username === username);
};

/**
 * Mengecek apakah username & password cocok
 */
const authenticatedUser = (username, password) => {
  return users.find(
    (user) => user.username === username && user.password === password,
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
  const accessToken = jwt.sign({ data: username }, "access", {
    expiresIn: 60 * 60,
  });

  // Simpan token di session
  req.session.authorization = {
    accessToken,
  };

  return res.status(200).json({ message: "Login successful" });
});

// Tambah / update review buku
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  // Mengambil dari body, jika tidak ada ambil dari query
  const review = req.body.review || req.query.review;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Logic simpan review...
  books[isbn].reviews[username] = review;
  return res.status(200).json({
    message: `The review for the book with ISBN ${isbn} has been added/updated.`,
    reviews: books[isbn].reviews,
  });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Pastikan cara ambil username sama dengan rute PUT

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username]; // Menghapus review milik user yang sedang login
    return res
      .status(200)
      .json({ message: `Review for ISBN ${isbn} deleted successfully.` });
  } else {
    return res.status(404).json({ message: "Review not found for this user" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
