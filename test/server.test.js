const StandardError = require('standard-error')
const express = require('express')
const co = require('co')
const sinon = require('sinon')
const axios = require('axios')
const bodyParser = require('body-parser')
const expect = require('chai').expect
const router = require('../server/github')
const logger = require('../server/util/logger')
const asana = require('../server/util/asana')
const fixtures = require('./fixtures')

const BASE_URL = '/v1/github'
const PORT = 8999
const ROOT_URL = `http://localhost:${PORT}`

const REQUEST_BASE = {
  baseURL: `${ROOT_URL}${BASE_URL}`,
  headers: {
    'Content-Type': 'application/json'
  }
}

function _request (obj) {
  const data = Object.assign({}, REQUEST_BASE, obj)
  return axios(data)
    .catch(error => {
      const _error = error.response.data.error || error.response.data
      throw Object.assign(new StandardError(_error), { stack: _error.stack })
    })
}

describe('API', function () {
  let server

  before(function (done) {
    co(function * () {
      server = express()
        .use(bodyParser.json())
        .use(BASE_URL, router())
        .listen(PORT)
      done()
    }).catch(done)
  })

  after(function () {
    server.close()
  })

  beforeEach(function () {
    sinon.stub(logger, 'info')
    sinon.stub(logger, 'error')
    sinon.stub(logger, 'capture')

    sinon.stub(asana.stories, 'createOnTask').callsFake((a, b) => {
      return Promise.resolve({})
    })
  })

  afterEach(function () {
    logger.info.restore()
    logger.capture.restore()
    logger.error.restore()

    asana.stories.createOnTask.restore()
  })

  describe('/pr', function () {
    it('should create a comment on asana task', function * () {
      const res = yield _request({
        method: 'post',
        url: '/pr',
        data: fixtures.prclose
      })

      expect(res.status).to.equal(200)
      expect(asana.stories.createOnTask).to.have.callCount(1)
      expect(logger.capture).to.have.been.called
      expect(logger.info).to.have.been.called
      expect(logger.error).not.to.have.been.called
    })

    it('fails should catch in logger', function * () {
      logger.capture.throws('TypeError')

      const res = yield _request({
        method: 'post',
        url: '/pr',
        data: fixtures.prclose
      })

      expect(res.status).to.equal(200)
      expect(logger.error).to.have.been.called
    })
  })

  describe('/push', function () {
    it('should create a comment on asana task', function * () {
      const res = yield _request({
        method: 'post',
        url: '/push',
        data: fixtures.push
      })

      expect(res.status).to.equal(200)
      expect(asana.stories.createOnTask).to.have.callCount(1)
    })
  })
})
