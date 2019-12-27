require('dotenv').config()
const ENV = process.env.NODE_ENV
const configVars = require('./server.config')[ENV]

const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')

const mongoose = require('mongoose')
const connectionString = configVars.mongoConnectionString


const app = express()
const router = express.Router()

// load cors middleware
// TODO: set sensible settings for this middleware
app.use(cors())

// load body-parser middleware
app.use(bodyParser.json())
app.use(function (err, req, res, next) {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.status(400).send({ status: 400, error: 'Error: Bad request body' })
    } else next()
})
app.use(bodyParser.urlencoded({
    extended: true
}))

// logger for dev use
if (ENV !== 'production') {
    app.use(logger('dev'))
}

mongoose.connect(connectionString, { useNewUrlParser: true })
const routes = require('./routes')
app.use('/', routes(router))

app.listen(configVars.port, () => console.log(`Listening on port ${configVars.port}`))

module.exports = app