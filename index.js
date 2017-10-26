const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const {github} = require('./routes')

const m = multer({})
const app = express()
const router = express.Router()

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

// var client = asana.Client.create().useAccessToken('0/529d75c6884f082b63db4fa40d82e152')
//
// client.stories.createOnTask('463188047425685', {
//   text: 'Testing my comments ' + new Date().toISOString()
// }).then(res => {
//   console.log(res)
// }).catch(err => {
//   console.error(err)
// })
