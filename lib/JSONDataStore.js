/**
 * A CRUD library used for storing and editing data within the filesystem datastore
 * We are using the filesystem as a key value datastore, for simplicity.
 * We are using the hidden .data/ directory as our datastore. Subdirectories will represent a collection or database table.
 */

const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')

class JSONDataStore {
	// Base directory of the datastore
	baseDir = path.join(__dirname, '../.data/')

	/**
	 *
	 * Creates a file in our datastore and writes data to it
	 * @param {string} dir - The subdirectory or collection to write into
	 * @param {string} filename - The name of the new file being created
	 * @param {object} data - The data to write into the file
	 * @param {function} cb - A callback to pass back an error if occurred and data
	 */
	create = (dir, filename, data, cb) => {
		// Create directory if it doesn't exist
		const repoDirname = `${this.baseDir}${dir}`
		if (!fs.existsSync(repoDirname)) {
			fs.mkdirSync(repoDirname)
		}

		// Open the file for writing
		const newFilename = `${repoDirname}/${filename}.json`
		fs.open(newFilename, 'wx', (err, fileDescriptor) => {
			if (!err && fileDescriptor) {
				// Convert data to string
				const stringData = JSON.stringify(data)
				// Write to file and close it
				fs.writeFile(fileDescriptor, stringData, err => {
					if (!err) {
						fs.close(fileDescriptor, err => {
							if (!err) {
								// Get filesize and construct response data
								const { size } = fs.statSync(newFilename)
								const responseData = { oid: filename, size }
								cb(false, responseData)
							} else {
								cb({ status: 500, message: 'Error closing new file' })
							}
						})
					} else {
						cb({ status: 500, message: 'Error writing to new file' })
					}
				})
			} else {
				cb({ status: 409, message: 'Could not create new file, it may already exist' })
			}
		})
	}

	/**
	 * Reads data from a file in our datastore
	 * @param {string} dir - The subdirectory or collection to read from
	 * @param {string} filename - The name of the file to read from
	 * @param {function} cb - A callback to fire to handle any error and/or data
	 */
	read = (dir, filename, cb) => {
		fs.readFile(`${this.baseDir}${dir}/${filename}.json`, 'utf-8', (err, data) => {
			if (!err && data) {
				const parsedData = helpers.parseJsonStringToObject(data)
				cb(false, parsedData)
			} else {
				cb(err)
			}
		})
	}

	/**
	 * Deletes a file from our datastore
	 * @param {string} dir - The subdirectory or collection to delete from
	 * @param {string} filename - The name of the file to be deleted
	 * @param {function} cb - A callback to fire when there is an error
	 */
	delete = (dir, filename, cb) => {
		// Unlink the file
		fs.unlink(`${this.baseDir}${dir}/${filename}.json`, err => {
			if (!err) cb(false)
			else cb('Error deleting the file')
		})
	}
}

const datastore = new JSONDataStore()

module.exports = datastore
