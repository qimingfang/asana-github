const express = require('express')
const multer = require('multer')
const url = require('url')
const asana = require('./util/asana')
const logger = require('./util/logger')

module.exports = function () {
  const router = express.Router()
  const m = multer({})

  router.post('/push', m.any(), (req, res) => {
    try {
      if (req.body) {
        logger.capture('Push', req.body)
        const commits = req.body.commits || []

        commits.forEach(commit => {
          parseAndCommentOnAsana(
            commit.message,
            '(Auto Generated) Pushed commit:\n' + commit.url)
        })
      }
    } catch (error) {
      logger.error(error)
    }

    res.sendStatus(200)
  })

  router.post('/pr', m.any(), (req, res) => {
    try {
      if (req.body) {
        logger.capture('Pull Request', req.body)

        switch (req.body.action) {
          case 'closed':
            const pr = req.body.pull_request

            // only procecess the merged PRs
            if (pr && pr.body && pr.merged) {
              parseAndCommentOnAsana(
                pr.body,
                '(Auto Generated) Merged PR:\n' + pr.html_url)
            }
            break

          default:
            logger.info(`${req.body.action} is not supported yet.`)
            break
        }
      }
    } catch (error) {
      logger.error(error)
    }

    res.sendStatus(200)
  })

  return router
}

/**
 * @param message - the message that we want to parse
 *        (this can be from a PR, commit, etc)
 * @asanaMessage - the message that we want to post to
 *        asana when parsing this comment.
 */
function parseAndCommentOnAsana (message, asanaMessage) {
  // parse the lines that contain Asana info
  const splitted = message.split('\n')
  const asanaLines = splitted
    .filter(line => line.startsWith('https://app.asana'))

  // capture this, in case we need to look at it later
  logger.capture('Asana tickets to process', asanaLines)

  asanaLines.forEach(asanaLine => {
    const asanaPath = url.parse(asanaLine).path

    // example: [ '', '0', '248400113261909', '463141492036657' ]
    const asanaSegments = asanaPath.split('/')

    if (asanaSegments.length === 4) {
      const taskId = asanaSegments[3]

      asana.stories.createOnTask(taskId, {
        text: asanaMessage
      }).then(res => {
        logger.info('Asana comment posted', Object.assign({}, res, {
          asanaMessage
        }))
      }).catch(err => {
        logger.error(err)
      })
    }
  })
}
