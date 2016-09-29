var r = require('rethinkdbdash')({
  port: process.env.RETHINK_DB_PORT,
  timeoutGb: 1000
})

module.exports = r
