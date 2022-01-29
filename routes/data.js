const express = require('express')
const crypto = require('crypto')
const _data = require('../lib/JSONDataStore')
const { checkIfValidSHA256 } = require('../lib/helpers')
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
 */
router.get('/:repo/:oid', (req, res) => {
	const { repo: dir, oid } = req.params

	// Validation - ensure the oid is a valid hash
	if (!checkIfValidSHA256(oid)) {
		// NOTE: Typically 400 is the correct code to return for a bad response, but the original test expects a 404.
		// I don't want to alter the original test, as based off of the requirements.
		// Since my implementation is expecting hashes for OIDs, I'd have two tests, one for invalid hashes
		// and one for a hash that doesn't exists, and expect 400 and 404 respectively.
		res.status(404).json({ message: 'Invalid parameters - OID must be a valid SHA256 hash' })
		return
	}

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
 */
router.delete('/:repo/:oid', (req, res) => {
	const { repo: dir, oid } = req.params

	// Validation - ensure the oid is a valid hash
	if (!checkIfValidSHA256(oid)) {
		// NOTE: Typically 400 is the correct code to return for a bad response, but the original test expects a 404.
		// I don't want to alter the original test, as based off of the requirements.
		// Since my implementation is expecting hashes for OIDs, I'd have two tests, one for invalid hashes
		// and one for a hash that doesn't exists, and expect 400 and 404 respectively.
		res.status(404).json({ message: 'Invalid parameters - OID must be a valid SHA256 hash' })
		return
	}

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
