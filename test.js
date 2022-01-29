// The existing tests in this file should not be modified,
// but you can add more tests if needed.

const supertest = require('supertest')
const server = require('./server.js')
const fs = require('fs')
const path = require('path')
const { logger } = require('./startup/logging')

const cleanTestDirectory = () => {
	const testDirPath = path.join(__dirname, '/.data/cats')
	if (fs.existsSync(testDirPath)) {
		const files = fs.readdirSync(testDirPath)

		if (files.length > 0) {
			files.forEach(function (filename) {
				if (fs.statSync(testDirPath + '/' + filename).isDirectory()) {
					removeDir(testDirPath + '/' + filename)
				} else {
					fs.unlinkSync(testDirPath + '/' + filename)
				}
			})
			fs.rmdirSync(testDirPath)
		} else {
			fs.rmdirSync(testDirPath)
		}
	} else {
		logger.warn('Directory path not found.')
	}
}

describe('data-storage-api-node', () => {
	beforeAll(cleanTestDirectory)

	test('PUT', async () => {
		const putResult = await supertest(server)
			.put('/data/cats')
			.send({ name: 'Ada' })
			.set('Accept', 'application/json')
			.expect('Content-Type', /json/)
			.expect(201)

		expect(putResult.body).toBeTruthy()
		expect(typeof putResult.body).toBe('object')
		expect(putResult.body).toHaveProperty('oid')
		expect(typeof putResult.body.oid).toBe('string')
		expect(putResult.body.oid.length).toBeGreaterThan(0)
		expect(putResult.body).toHaveProperty('size')
		expect(typeof putResult.body.size).toBe('number')
		expect(putResult.body.size).toBeGreaterThan(0)
	})

	test('GET', async () => {
		const putResult1 = await supertest(server)
			.put('/data/cats')
			.send({ name: 'Boo' })
			.set('Accept', 'application/json')
			.expect(201)

		const putResult2 = await supertest(server)
			.put('/data/cats')
			.send({ name: 'Chester' })
			.set('Accept', 'application/json')
			.expect(201)

		expect(putResult1.body.oid).not.toBe(putResult2.body.oid)

		await supertest(server)
			.get(`/data/cats/${putResult1.body.oid}`)
			.expect(200)
			.then(response => {
				expect(response.body).toEqual({ name: 'Boo' })
			})

		await supertest(server)
			.get(`/data/cats/${putResult2.body.oid}`)
			.expect(200)
			.then(response => {
				expect(response.body).toEqual({ name: 'Chester' })
			})
	})

	test('GET non-existent object', async () => {
		await supertest(server).get('/data/cats/noooope').expect(404)
	})

	test('DELETE', async () => {
		const putResult = await supertest(server)
			.put('/data/cats')
			.send({ name: 'Daisy' })
			.set('Accept', 'application/json')
			.expect(201)

		const hash = putResult.body.oid

		await supertest(server).delete(`/data/cats/${hash}`).expect(200)

		await supertest(server).get(`/data/cats/${hash}`).expect(404)
	})

	test('DELETE non-existent object', async () => {
		await supertest(server).delete('/data/cats/noooope').expect(404)
	})
})
