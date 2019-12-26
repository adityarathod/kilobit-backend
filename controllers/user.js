const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const connectionString = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_SERVER}/${process.env.MONGO_NAMESPACE}?retryWrites=true&w=majority`

class UserNotFoundError extends Error {
    constructor(message) {
        super(message)
    }
}

class AuthError extends Error {
    constructor(message) {
        super(message)
    }
}

class IncompleteRequestError extends Error {
    constructor(message) {
        super(message)
    }
}

var controller = {}

controller.add = async (req, res) => {
    const { displayName, username, password, utcOffset } = req.body
    let result = {}, status = 201
    var error = null
    try {
        if (!displayName || !username || !password || !utcOffset) throw new IncompleteRequestError('Not all parameters passed')
        await mongoose.connect(connectionString, { useNewUrlParser: true })
        const newUser = new User({
            displayName,
            username,
            password,
            utcOffset,
            verified: false,
            numFollowers: 0,
            botUser: false,
            lastSeenClient: 'kilobit web',
            lastLogin: new Date(),
            userLevel: 'normal'
        })
        await newUser.save()
        result.result = newUser
    } catch (err) {
        error = err
        if (err instanceof IncompleteRequestError) status = 400
        else {
            status = 500
            error = null
        }
    } finally {
        if (error) result.error = error
        res.status(status).send(result)
    }
}

controller.login = async (req, res) => {
    const { username, password, client } = req.body
    let result = {}, status = 200
    var token = null, user = null, error = null
    try {
        if (!username || !password || !client) throw new IncompleteRequestError('Not all parameters passed')
        await mongoose.connect(connectionString, { useNewUrlParser: true })
        const usr = await User.findOne({ username })
        if (!usr) throw new UserNotFoundError('User not found')
        const match = await bcrypt.compare(password, usr.password)
        if (!match) throw new AuthError('Authentication failure')
        const payload = { username: usr.username, userLevel: usr.userLevel }, options = { expiresIn: '2d', issuer: 'https://kilobit.now.sh' }, secret = process.env.JWT_SECRET
        token = jwt.sign(payload, secret, options)
        user = usr
        usr.lastSeenClient = client
        usr.lastLogin = new Date()
        await usr.save()
    } catch (err) {
        error = err
        if (err instanceof UserNotFoundError) status = 404
        else if (err instanceof AuthError) status = 401
        else if (err instanceof IncompleteRequestError) status = 400
        else {
            status = 500
            error = null
        }
    } finally {
        result.status = status
        if (user) result.result = user
        if (error) result.error = error
        if (token) result.token = token
        res.status(status).send(result)
    }
}

module.exports = controller