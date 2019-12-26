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



var userController = {}

userController.add = (req, res) => {
    mongoose.connect(connectionString, { useNewUrlParser: true }, (err) => {
        let resObj = {}
        let status = 201
        if (!err) {
            const { displayName, username, password, utcOffset } = req.body
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
            newUser.save((err, usr) => {
                if (!err) {
                    resObj.status = status
                    resObj.result = usr
                } else {
                    status = 500
                    resObj.status = status
                    resObj.error = err
                }
                res.status(status).send(resObj)
            })
        } else {
            status = 500
            resObj.status = status
            resObj.error = err
            res.status(status).send(resObj)
        }
    })
}

userController.login = async (req, res) => {
    const { username, password, client } = req.body
    let result = {}, status = 200
    var error = null, token = null, user = null
    try {
        if (!username || !password || !client) throw new IncompleteRequestError('Not all parameters passed')
        await mongoose.connect(connectionString, { useNewUrlParser: true })
        const usr = await User.findOne({ username })
        if (!usr) throw new UserNotFoundError('User not found')
        const match = await bcrypt.compare(password, usr.password)
        if (!match) throw new AuthError('Authentication failure')
        const payload = { username: usr.username }, options = { expiresIn: '2d', issuer: 'https://kilobit.now.sh' }, secret = process.env.JWT_SECRET
        token = jwt.sign(payload, secret, options)
        user = usr
        usr.lastSeenClient = client
        usr.lastLogin = new Date()
        await usr.save()
    } catch (err) {
        error = err.toString()
        if (err instanceof mongoose.mongo.MongoError) status = 500
        else if (err instanceof UserNotFoundError) status = 404
        else if (err instanceof AuthError) status = 401
        else if (err instanceof IncompleteRequestError) status = 400
        else status = 500
    } finally {
        result.status = status
        if (error) result.error = error
        if (user) result.result = user
        if (token) result.token = token
        res.status(status).send(result)
    }
}

module.exports = userController