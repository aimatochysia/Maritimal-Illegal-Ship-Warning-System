const express = require('express');
const path = require('path');
const { Client } = require('pg');
const cors = require('cors'); // Import cors module

const app = express();
const PORT = process.env.PORT || 5000;

const DATABASE_URL = "postgresql://petra:Cd0DF6w8zIqedvVuLb91iQ@agile-db-9455.8nk.gcp-asia-southeast1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";
const client = new Client(DATABASE_URL);

client.connect()
  .then(() => console.log("Connected to the database"))
  .catch(err => console.error("Database connection error:", err));

// Middleware to parse JSON
app.use(express.json());

// Allow requests from all origins during development
app.use(cors());

// Serve static files from the frontend build folder
app.use(express.static(path.join(__dirname, '../../build')));

const selectUserQuery = `SELECT * FROM users WHERE email = $1;`;

async function getUserByEmail(email) {
  try {
    const result = await client.query(selectUserQuery, [email]);
    return result.rows[0]; // Assuming email is unique, returning the first result
  } catch (err) {
    console.error("Error selecting user:", err);
    throw err;
  }
}

app.get('/api/user/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const user = await getUserByEmail(email);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Serve the frontend's index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
