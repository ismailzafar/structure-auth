process.on('uncaughtException', function(err) {
  if(err && err.stack) {
    console.error(err.message)
    console.error(err.stack)
  } else {
    console.error(err)
  }
})

process.on('unhandledRejection', function(err) {
  console.error('Unhandled Rejection')
  if(err && err.stack) {
    console.error(err.message)
    console.error(err.stack)
  } else {
    console.error(err)
  }

})

require('babel-core/register')

var path = require('path')
require('dotenv').config({path: path.join(__dirname, '../.env')})

var chai  = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai')

chai.use(sinonChai)

global.expect = chai.expect
global.sinon  = sinon
