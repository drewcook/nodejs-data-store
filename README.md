# Data Storage API (Node.js) :turtle::rocket:

* This data store is a small HTTP service in Node.js to store objects organized by repository.
* Clients of this service should be able to `GET`, `PUT`, and `DELETE` objects.
* The service will identify objects by their content. This means that two objects with the same content should be considered identical, and only one such object should be stored per repository. Objects with the same content can exist in different repositories.
* The service should implement the API as described below.

## API

### Upload an Object

```
PUT /data/{repository}
```

#### Response

```
Status: 201 Created
{
  "oid": "2845f5a412dbdfacf95193f296dd0f5b2a16920da5a7ffa4c5832f223b03de96",
  "size": 1234
}
```

### Download an Object

```
GET /data/{repository}/{objectID}
```

#### Response

```
Status: 200 OK
{object data}
```

Objects that are not on the server will return a `404 Not Found`.

### Delete an Object

```
DELETE /data/{repository}/{objectID}
```

#### Response

```
Status: 200 OK
```

## Getting started and Testing

This service requires a recent version of Node.js. Get started by installing dependencies:

```sh
npm install
```

Then run the tests:

```sh
npm test
```

Or run them continuously as you work:

```sh
npm run test-watch
```
