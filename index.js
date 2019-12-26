require('dotenv').config()
const ENV = process.env.NODE_ENV
const configVars = require('./server.config')[ENV]

const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')


const app = express()
const router = express.Router()

// load body-parser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

// logger for dev use
if (ENV !== 'production') {
    app.use(logger('dev'))
}

const routes = require('./routes')
app.use('/api/v1', routes(router))

app.listen(configVars.port, () => console.log(`Listening on port ${configVars.port}`))

module.exports = app