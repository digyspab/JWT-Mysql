const mysql = require('mysql');
const util = require('util')

const mysqlDB = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'jwt_mysql'
})

/**
 * Although this MySQL npm package does not support async/await, 
 * Node.js has a solution for such case. Its included promisify utility is coming to the rescue.
 */
// Ping database to check for common exception errors.
mysqlDB.getConnection((err, connection) => {
  if (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.')
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has too many connections.')
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused.')
    }
  }

  if (connection) connection.release()
  console.log('connected to database')

  return
})

// Promisify for Node.js async/await.
mysqlDB.query = util.promisify(mysqlDB.query)


module.exports = mysqlDB;