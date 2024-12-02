const { Client } = require('pg');
 
const pool = new Client({
  user: 'postgres',
  password: 'admin!234',
  host: 'ilight.c1ee2wqcwgd4.ap-southeast-2.rds.amazonaws.com',
  database: 'ilight',
  port: 5432,
  ssl: {
    rejectUnauthorized: false  // For development; consider proper cert verification in production
  }
})
 


async function fetchData(query) {
    try {
        await pool.connect();  // Establish connection to the database
        const res = await pool.query(query);  // Wait for the query to complete
        return res;  // Print the actual rows returned by the query
    } catch (err) {
        console.error('Error executing query:', err);
    } finally {
        await pool.end();  // Close the database connection
    }
}

const query = "SELECT * FROM information_schema.tables";
fetchData(query);