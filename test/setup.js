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

// Babel by default ignores everything in node_modules - we need to explicitly
// compile test suites from dependencies so we can import their test APIs
require("babel-core/register")({
  ignore: /node_modules\/(?!structure-\S+\/test)/
})

var path = require('path')
require('dotenv').config({path: path.join(__dirname, '../.env')})

var chai  = require('chai'),
    sinon = require('sinon'),
    sinonChai = require('sinon-chai')

chai.use(sinonChai)

global.expect = chai.expect
global.sinon  = sinon
