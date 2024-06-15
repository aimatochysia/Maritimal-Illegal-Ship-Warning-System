const express = require('express');
const path = require('path');
const { Client } = require('pg');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

const DATABASE_URL = "postgres://default:0UNeuqozGaF6@ep-proud-rain-a1bew3r1.ap-southeast-1.aws.neon.tech:5432/verceldb?sslmode=require";
const client = new Client(DATABASE_URL);

client.connect()
  .then(() => console.log("Connected to the database"))
  .catch(err => console.error("Database connection error:", err));

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../../build')));

const selectUserQuery = `SELECT * FROM users WHERE email = $1;`;

async function getUserByEmail(email) {
  try {
    const result = await client.query(selectUserQuery, [email]);
    return result.rows[0];
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
