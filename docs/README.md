# Available API Calls

## Version 1 (prefixed with `/v1/`)

- `GET /user`
	- get all users (only if an admin)
- `POST /user`
	- create a user
- `GET /user/<username>`
	- get information about a user
- `GET /user/<username>/bits`
	- get a user's bits
- `POST /user/<username>/bits`
	- create a bit
- `GET /user/<username>/feed`
	- get a user's feed
- `GET /bit` (NOT YET IMPLEMENTED)
	- firehose of latest 100 bits
- `GET /bit/<id>`
	- get information and replies from a bit
- `POST /token`
	- get a token with the given username and password