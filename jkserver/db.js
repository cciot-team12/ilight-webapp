const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Table Schema:
// const query = `CREATE TABLE alarms (
// id VARCHAR(100) PRIMARY KEY,
// time VARCHAR(100),
// repeat VARCHAR(100),
// disabled BOOLEAN
// )`
 
const pool = new Pool({
  user: 'postgres',
  password: 'admin!234',
  host: 'ilight.c1ee2wqcwgd4.ap-southeast-2.rds.amazonaws.com',
  database: 'ilight',
  port: 5432,
  ssl: {
    rejectUnauthorized: false  // For development; consider proper cert verification in production
  }
})


async function exec(query, values=undefined) {
  try {
      const res = await pool.query(query, values);  // Wait for the query to complete
      await pool.query('COMMIT');
      return res;  // Print the actual rows returned by the query
  } catch (err) {
      console.error('Error executing query:', err);
  }
}


async function run() {
  // const query = "SELECT * FROM information_schema;"
  // const query = "DROP TABLE alarms;"
  const result = await exec(query);
  console.log(result);  // Print the result of the query
}

// run()

async function createAlarmInDB(time, repeat, disabled) {
  console.log("inserting")
  const uuid = uuidv4();
  const query = `
      INSERT INTO alarms (id, time, repeat, disabled)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
  `;

  const values = [uuid, time, repeat, disabled];
  const result = await exec(query, values);
  return result.rows[0];
  
}

async function readAllAlarmsInDB() {
  const query = `
      SELECT * FROM alarms;
  `;
  
  const result = await exec(query);
  return result.rows;  // Return the list of alarms from the result
}

async function deleteAlarmInDB(alarmID) {
  const query = `
      DELETE FROM alarms
      WHERE id = $1
      RETURNING *;
  `;
  
  const values = [alarmID];
  const result = await exec(query, values);
  return result.rowCount > 0;  // Return true if a row was deleted, false otherwise
}

async function updateAlarmInDB(alarmID, time, repeat, disabled) {
  console.log("updating alarm in DB")
  let query = 'UPDATE alarms SET';
  const values = [];
  let setClauses = [];
  
  // Check if each parameter is provided and build the query dynamically
  if (time) {
      setClauses.push(' time = $' + (values.length + 1));
      values.push(time);
  }
  if (repeat) {
      setClauses.push(' repeat = $' + (values.length + 1));
      values.push(repeat);
  }
  if (disabled !== undefined) {
      setClauses.push(' disabled = $' + (values.length + 1));
      values.push(disabled);
  }

  // If no updates were provided, we return early
  if (setClauses.length === 0) {
      throw new Error('At least one parameter must be provided for update.');
  }

  // Add the SET part and the WHERE condition
  query += setClauses.join(', ') + ' WHERE id = $' + (values.length + 1) + ' RETURNING *;';
  values.push(alarmID);
  // console.log(query);
  // console.log(values);

  try {
    // Execute the query
    const result = await exec(query, values);

    if (result.rows.length === 0) {
      throw new Error('No alarm found with the given ID.');
    }

    // Return the updated alarm object
    return result.rows[0];  // The updated alarm object
  } catch (error) {
    console.error('Error updating alarm:', error);
    throw error;
  }
}


module.exports = { createAlarmInDB, readAllAlarmsInDB, deleteAlarmInDB, updateAlarmInDB };