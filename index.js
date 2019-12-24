require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const app = express()
const User = require('./models/User')
const port = process.env.PORT

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_SERVER}/${process.env.MONGO_NAMESPACE}?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
).then(() => console.log('db connected.'))

app.use()

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Listening on port ${port}`))