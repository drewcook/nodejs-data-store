const express = require('express')
const crypto = require('crypto')
const _data = require('../lib/JSONDataStore')
const router = express.Router()

/**
 * PUT object
 */
router.put('/:repo', (req, res) => {
	const dir = req.params.repo
	// TODO: Validation for declarative params to support
	const payload = req.body

	// Prevent duplicate data from being written by hashing the payload
	const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')

	if (hash) {
		// Write to our datastore
		_data.create(dir, hash, payload, (err, data) => {
			if (err) {
				// General error for now
				res.status(err.status).json({ message: `Error creating new repo object - ${err.message}` })
			} else {
				console.log(data)
				res.status(201).json(data)
			}
		})
	} else {
		res
			.status(500)
			.json({ message: 'Error creating new repo object - Failed to hash the given payload' })
	}
})

module.exports = router
