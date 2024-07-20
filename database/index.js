// Get the client
import mysql from "mysql2/promise";

import "dotenv/config";

// Create the connection to database
const db = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "test",
});

export default db;
