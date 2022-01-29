const express = require('express')
const logError = require('../middleware/logError')
const homeRoutes = require('../routes/home')
const dataRoutes = require('../routes/data')

/**
 * Sets up the routes and middleware for the server to use within them.
 * - JSON parsing
 * - Querystring parsing
 * - Homepage routes
 * - Data routes
 * @param server - The Express server instance
 */
const setupRoutes = server => {
	/**
	 * Built-in Express middleware
	 */
	// Parses req.body, built into Express ^4.16.0
	server.use(express.json())
	// Parses query params and populates req.body in json - key=value&key=value
	server.use(express.urlencoded({ extended: true }))

	// Setup API routes
	server.use('/', homeRoutes)
	server.use('/data', dataRoutes)

	/**
	 * Custom Middleware
	 */
	// Add in error handling middleware after API middleware
	// We will use next(ex) in catch blocks to call this
	server.use(logError)
}

module.exports = setupRoutes
