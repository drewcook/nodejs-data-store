const express = require('express')

const server = express()

server.disable('x-powered-by')

// Setup the logger
const { setupLogging, logger } = require('./startup/logging')
setupLogging(server)

// Setup the routes
require('./startup/routes')(server)

// The tests exercise the server by requiring it as a module,
// rather than running it in a separate process and listening on a port
module.exports = server

if (require.main === module) {
	// Start server only when we run this on the command line and explicitly ignore this while testing
	const port = process.env.PORT || 3000
	server.listen(port, () => {
		logger.info(`App listening at http://localhost:${port}`)
	})
}
