const { checkIfValidSHA256 } = require('../lib/helpers')

/**
 * Express middleware to validate an incoming OID in the payload
 */
const validateOid = (err, req, res, next) => {
	const { oid } = req.params

	if (!checkIfValidSHA256(oid) || !oid) {
		// NOTE: Typically 400 is the correct code to return for a bad response, but the original test expects a 404.
		// I don't want to alter the original test, as based off of the requirements.
		// Since my implementation is expecting hashes for OIDs, I'd have two tests, one for invalid hashes
		// and one for a hash that doesn't exists, and expect 400 and 404 respectively.
		res.status(404).json({ message: 'Invalid parameters - OID must be a valid SHA256 hash' })
		return
	}
}

module.exports = validateOid
