const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// ✅ Serve static files from /var/www/html
app.use(express.static("/home/ubuntu/UC2"));

// Database configuration
const dbConfig = {
    host: "", // Replace with your RDS endpoint
    user: "admin", // Replace with your RDS username
    password: "", // Replace with your RDS password
    database: "" // Database name
};

// Create MySQL connection
const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password
});

connection.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.stack);
        return;
    }
    console.log("✅ Connected to RDS successfully!");

    // Create database if it does not exist
    connection.query("CREATE DATABASE IF NOT EXISTS database_1", (err) => {
        if (err) throw err;
        console.log("✅ Database ensured!");

        // Now select the database and create a new connection
        connection.changeUser({ database: "database_1" }, (err) => {
            if (err) throw err;
            console.log("✅ Using database: database_1");

            // Create table if it doesn't exist
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS logins (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            connection.query(createTableQuery, (err) => {
                if (err) throw err;
                console.log("✅ Table ensured!");
            });
        });
    });
});

// ✅ Serve login page for GET /
app.get("/", (req, res) => {
    res.sendFile(path.join("/home/Ubuntu/UC2", "index.html"));
});

// ✅ Serve login page for GET /login
app.get("/login", (req, res) => {
    res.sendFile(path.join("/home/ubuntu/UC2", "index.html"));
});

// ✅ Handle login data submission (POST request)
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password required!" });
    }

    // Insert user login data into MySQL database
    const insertQuery = "INSERT INTO logins (username, password) VALUES (?, ?)";
    connection.query(insertQuery, [username, password], (err) => {
        if (err) {
            console.error("❌ Error saving login data:", err);
            return res.status(500).json({ error: "Failed to save login data!" });
        }
        console.log("✅ Login saved successfully!");
        res.status(200).json({ message: "Login successful!" });
    });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
