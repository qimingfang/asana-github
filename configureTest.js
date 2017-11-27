// Monkey patch Mocha to accept generators
const mocha = require('mocha')
const coMocha = require('co-mocha')
coMocha(mocha)

const chai = require('chai')
const sinonChai = require('sinon-chai')
chai.use(sinonChai)
