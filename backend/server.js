import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";
import cors from "cors";
import csrf from "csurf";
import cookieParser from "cookie-parser"; 

const app = express();

const allowedOrigins = [""]; 

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        return callback(new Error("CORS policy: Not allowed by CORS"), false);
      }
      return callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true, 
  })
);

app.use(express.json());

app.use(cookieParser());

const csrfProtection = csrf({ cookie: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

const connection = new sqlite3.Database("./db/aplikasi.db", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to SQLite database");
  }
});

app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.cookie("XSRF-TOKEN", req.csrfToken()); 
  res.json({ csrfToken: req.csrfToken() });
});

app.get("/api/user/:id", (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return res.status(400).send("Invalid user ID");
  }
  const query = `SELECT * FROM users WHERE id = ?`;
  connection.all(query, [userId], (error, results) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }
    res.json(results);
  });
});

app.post("/api/user/:id/change-email", csrfProtection, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const newEmail = req.body.email;

  if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
    return res.status(400).send("Invalid email format");
  }

  const query = `UPDATE users SET email = ? WHERE id = ?`;
  connection.run(query, [newEmail, userId], function (err) {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    if (this.changes === 0) {
      res.status(404).send("User not found");
    } else {
      res.status(200).send("Email updated successfully");
    }
  });
});

app.get("/api/file", (req, res) => {
  const filePath = path.join(__dirname, "files", req.query.name);
  const resolvedPath = path.resolve(filePath);

  if (!resolvedPath.startsWith(path.resolve(__dirname, "files"))) {
    return res.status(403).send("Access denied");
  }

  res.sendFile(resolvedPath, (err) => {
    if (err) {
      res.status(404).send("File not found");
    }
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
