const express = require('express')
const crypto = require('crypto')
const _data = require('../lib/JSONDataStore')
const validateOid = require('../middleware/validateOid')
const router = express.Router()

/**
 * PUT object
 */
router.put('/:repo', (req, res) => {
	const dir = req.params.repo
	const payload = req.body

	// Validation to expect at least 'name' field
	const name =
		typeof payload.name === 'string' && payload.name.trim().length > 0 ? payload.name.trim() : false

	if (!name) {
		res.status(400).json({
			message: 'Invalid parameters - Expect to have at least a "name" field in the payload',
		})
		return
	}

	// Prevent duplicate data from being written by hashing the payload
	const hash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')

	if (hash) {
		// Write to our datastore
		_data.create(dir, hash, payload, (err, data) => {
			if (err) {
				// General error for now
				res.status(err.status).json({ message: `Error creating new repo object - ${err.message}` })
			} else {
				res.status(201).json(data)
			}
		})
	} else {
		res
			.status(500)
			.json({ message: 'Error creating new repo object - Failed to hash the given payload' })
	}
})

/**
 * GET object
 * Validates OID via middleware
 */
router.get('/:repo/:oid', validateOid, (req, res) => {
	const { repo: dir, oid } = req.params

	// Read the file from our datastore
	_data.read(dir, oid, (err, data) => {
		if (!err && data) {
			res.status(200).json(data)
		} else {
			// When valid OID but does not exist in our datastore
			res.status(404).json({ message: `Error reading repo object - ${err.message}` })
		}
	})
})

/**
 * DELETE object
 * * Validates OID via middleware
 */
router.delete('/:repo/:oid', validateOid, (req, res) => {
	const { repo: dir, oid } = req.params

	// Check that the object exists in our data store first
	_data.read(dir, oid, (err, data) => {
		if (!err && data) {
			// Delete the file from our datastore
			_data.delete(dir, oid, err => {
				if (err) {
					res.status(500).json({ message: err })
				} else {
					// Return back the original record being deleted
					res.status(200).json(data)
				}
			})
		} else {
			// When valid OID but does not exist in our datastore
			res.status(404).json({ message: `Error reading repo object - ${err.message}` })
		}
	})
})

module.exports = router
