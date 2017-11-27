const asana = require('asana')

module.exports = asana.Client.create().useAccessToken(process.env.ASANA_TOKEN)
