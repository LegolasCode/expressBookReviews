const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

// Session middleware untuk customer
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

// Authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
  // Cek apakah token tersedia di session
  if (!req.session.authorization) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const token = req.session.authorization.accessToken;

  // Verifikasi JWT
  jwt.verify(token, "access", (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "User not authenticated" });
    }

    // Simpan data user hasil decode token
    req.user = decoded.data;
    next();
  });
});

const PORT = 5000;

// Protected routes (butuh login)
app.use("/customer", customer_routes);

// Public routes
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));
