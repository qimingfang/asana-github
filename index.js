const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const {github} = require('./server')
const logger = require('./server/util/logger')

const m = multer({})
const app = express()
const router = express.Router()

logger.setUp()

app.use(bodyParser.json())
app.use('/v1', router)

app.get('/status', m.any(), (req, res) => {
  const status = {
    version: require('./package.json').version
  }
  return res.json(status)
})

router.use('/github', github())

// initialize the DB if needed
app.listen((process.env.PORT || 3000), (err) => {
  if (err) {
    return console.error(err)
  }
  console.log('server started')
})
