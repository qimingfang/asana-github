const express = require('express')
const multer = require('multer')
const url = require('url')
const asana = require('asana')
const Raven = require('raven')

if (process.env.SENTRY_URL) {
  Raven.config(process.env.SENTRY_URL)
    .install()
}

const client = asana.Client.create().useAccessToken(process.env.ASANA_TOKEN)

module.exports = function () {
  const router = express.Router()
  const m = multer({})

  router.post('/pr', m.any(), (req, res) => {
    try {
      if (req.body) {
        switch (req.body.action) {
          case 'closed':
            const pr = req.body.pull_request

            if (pr && pr.body && pr.merged) {
              const splitted = pr.body.split('\r\n')
              const asanaLines = splitted
                .filter(line => line.startsWith('https://app.asana'))

              asanaLines.forEach(asanaLine => {
                const asanaPath = url.parse(asanaLine).path

                // example: [ '', '0', '248400113261909', '463141492036657' ]
                const asanaSegments = asanaPath.split('/')

                if (asanaSegments.length === 4) {
                  const taskId = asanaSegments[3]

                  client.stories.createOnTask(taskId, {
                    text: '(Auto Generated) PR:\n' + pr.html_url
                  }).then(res => {
                    console.log(res)
                  }).catch(err => {
                    console.error(err)
                    capture(err)
                  })
                }
              })
            }

            break
        }
      }
    } catch (anything) {
      capture(anything)
    }

    res.sendStatus(200)
  })

  return router
}

function capture (err) {
  if (process.env.SENTRY_URL) {
    Raven.captureException(err)
  }
}
