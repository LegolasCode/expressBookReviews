const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

// router/general.js
public_users.get('/', function (req, res) {
  // Ini yang akan dipanggil oleh axios.get("http://localhost:5000/")
  return res.status(200).json(books); 
});

/**
 * POST /register
 * Mendaftarkan user baru
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // Cek apakah user sudah ada di dalam array
  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(400).json({ message: "Username already exists" });
  }

  // SIMPAN SEBAGAI OBJEK KE DALAM ARRAY (Agar cocok dengan .find() di login)
  users.push({ username: username, password: password });

  return res.status(201).json({ message: "User registered successfully" });
});

/**
 * GET /books
 * Mengambil seluruh daftar buku (Axios)
 */
public_users.get("/books", (req, res) => {
  axios
    .get("http://localhost:5000/") // Mengambil data dari endpoint utama
    .then((response) => {
      res.status(200).json(response.data);
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Error fetching books", error: err.message });
    });
});

/**
 * GET /isbn/:isbn
 * Search by ISBN – Using Axios
 */
public_users.get("/isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  axios
    .get("http://localhost:5000/")
    .then((response) => {
      const allBooks = response.data;
      if (allBooks[isbn]) {
        res.status(200).json(allBooks[isbn]);
      } else {
        res.status(404).json({ message: "Book not found" });
      }
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Error fetching book by ISBN", error: err.message });
    });
});

// Mengambil detail buku berdasarkan Author menggunakan Axios
public_users.get("/author/:author", function (req, res) {
  const authorParam = req.params.author.toLowerCase();

  // Gunakan port yang sesuai dengan server kamu (biasanya 5000)
  axios
    .get("http://localhost:5000/")
    .then((response) => {
      const allBooks = response.data;
      console.log("Data dari server:", allBooks); // Lihat apakah field 'author' ada
      console.log("Mencari author:", authorParam);

      const filteredBooks = Object.values(allBooks).filter(
        (book) => book.author.toLowerCase() === authorParam,
      );

      if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks);
      } else {
        // Penanganan error jika penulis tidak ditemukan (Sesuai Feedback)
        res.status(404).json({ message: "No books found for this author" });
      }
    })
    .catch((err) => {
      // Penanganan error jika server atau Axios bermasalah
      res.status(500).json({
        message: "Error fetching data using Axios",
        error: err.message,
      });
    });
});

/**
 * GET /title/:title
 * Search by Title – Using Axios
 */
public_users.get("/title/:title", (req, res) => {
  const titleParam = req.params.title.toLowerCase();
  axios
    .get("http://localhost:5000/")
    .then((response) => {
      const allBooks = response.data;
      const filteredBooks = Object.values(allBooks).filter(
        (book) => book.title.toLowerCase() === titleParam,
      );

      if (filteredBooks.length > 0) {
        res.status(200).json(filteredBooks);
      } else {
        res.status(404).json({ message: "No books found with this title" });
      }
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Error fetching book by title", error: err.message });
    });
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
