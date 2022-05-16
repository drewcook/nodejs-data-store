/**
 * Parses a JSON string to an object in all cases, without throwing
 * @param {string} jsonString - A JSON string
 */
const parseJsonStringToObject = jsonString => {
	try {
		const obj = JSON.parse(jsonString)
		return obj
	} catch {
		return {}
	}
}

/**
 * Check if string is a valid SHA256 hash using a regex
 * @param {string} str - The string to check against
 * @returns {boolean} - True if valid SHA256 hash, false otherwise
 */
const checkIfValidSHA256 = str => {
	// Regular expression
	const regexExp = /^[a-f0-9]{64}$/gi
	return regexExp.test(str)
}

module.exports = {
	parseJsonStringToObject,
	checkIfValidSHA256,
}
