const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Bit = require('../models/Bit')
const { UserNotFoundError, IncompleteRequestError, AuthError } = require('../errors')

var controller = {}

controller.add = async (req, res) => {
    const { displayName, username, password, utcOffset } = req.body
    let result = {}, status = 201
    var error = null
    try {
        if (!displayName || !username || !password || !utcOffset) throw new IncompleteRequestError('Not all parameters passed')
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
            userLevel: 'admin'
        })
        await newUser.save()
        result.result = newUser
    } catch (err) {
        error = err.toString()
        if (err instanceof IncompleteRequestError) status = 400
        else if (err instanceof mongoose.mongo.MongoError) {
            status = 400
            if (err.code === 11000) {
                status = 409
                error = 'Username already exists'
            }
        }
        else {
            status = 500
            error = null
        }
    } finally {
        result.status = status
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
        error = err.toString()
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

controller.getAll = async (req, res) => {
    let result = {}, status = 200
    var error = null
    try {
        const payload = req.decoded
        if (!payload || payload.userLevel != 'admin') throw new AuthError('Insufficient privileges')
        const users = await User.find({})
        if (!users) throw new UserNotFoundError()
        result.result = users
    } catch (err) {
        error = err.toString()
        if (err instanceof AuthError) status = 401
        else {
            status = 500
            error = null
        }
    } finally {
        result.status = status
        if (error) result.error = error
        res.status(status).send(result)
    }
}

controller.info = async (req, res) => {
    const { username } = req.params
    let result = {}, status = 200
    var error = null
    try {
        if (!username) throw new IncompleteRequestError('Not all parameters passed')
        const foundUser = await User.findOne({ username })
        if (!foundUser) throw new UserNotFoundError('User not found')
        result.result = {
            displayName: foundUser.displayName,
            username: foundUser.username,
            verified: foundUser.verified,
            numFollowers: foundUser.numFollowers,
            botUser: foundUser.botUser
        }
    } catch (err) {
        error = err.toString()
        if (err instanceof UserNotFoundError) status = 404
        else if (err instanceof IncompleteRequestError) status = 400
        else {
            status = 500
            error = null
        }
    } finally {
        result.status = status
        if (error) result.error = error
        res.status(status).send(result)
    }
}

controller.feed = async (req, res) => {
    const { username } = req.params
    let result = {}, status = 200
    var error = null
    try {
        if (!username) throw new IncompleteRequestError('Not all parameters passed')
        const foundUser = await User.findOne({ username }).cache(120)
        if (!foundUser) throw new UserNotFoundError('User not found')
        if (foundUser.following.length === 0) {
            result.result = []
        } else {
            const userList = foundUser.following.map(id => {
                return { user: id }
            })
            var bits = await Bit.find({ $or: userList }).populate('user', '-password -utcOffset -lastLogin -userLevel -lastSeenClient -following -__v -_id')
            result.result = bits.sort((a, b) => {
                const postScore = post => {
                    const postDelta = (new Date() - post.creationDate) / 1e6
                    var recencyScore = (100 / postDelta) || 100
                    var wasMentioned = 0
                    post.mentions.forEach(mention => {
                        if (mention.mentionText === `@${username}`) {
                            wasMentioned = 1
                        }
                    })
                    var totalScore = recencyScore + 0.1 * wasMentioned
                    return totalScore
                }
                return postScore(b) - postScore(a)
            })
        }
    } catch (err) {
        error = err.toString()
        if (err instanceof UserNotFoundError) status = 404
        else if (err instanceof IncompleteRequestError) status = 400
        else {
            status = 500
            error = null
        }
    } finally {
        result.status = status
        if (error) result.error = error
        res.status(status).send(result)
    }
}

module.exports = controller