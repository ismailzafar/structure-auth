var r = require('rethinkdbdash')({
  port: 28016,
  timeoutGb: 1000
})

module.exports = r
