const Raven = require('raven')
const version = require('../../package.json').version

// use sentry for logging for now.
// if we decide to change how logging is done, we just
// need to change the implementation of this file

exports.setUp = function () {
  // set up sentry for logging, if sentry url is provided.
  if (process.env.SENTRY_URL) {
    Raven.config(process.env.SENTRY_URL)
      .install()

    Raven.setTagsContext({
      version
    })
  }
}

// logs INFO
exports.info = function (message, data) {
  if (process.env.SENTRY_URL) {
    Raven.captureMessage(message, {
      level: 'info'
    })
  } else {
    console.log(message, data)
  }
}

// captures info for next log event
exports.capture = function (message, data) {
  if (process.env.SENTRY_URL) {
    Raven.captureBreadcrumb({
      message,
      data
    })
  } else {
    console.log(message, data)
  }
}

// logs ERROR
exports.error = function (err) {
  if (process.env.SENTRY_URL) {
    Raven.captureException(err)
  } else {
    console.error(err)
  }
}
