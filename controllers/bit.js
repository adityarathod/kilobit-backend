const mongoose = require('mongoose')
const Bit = require('../models/Bit')
const User = require('../models/User')
const { UserNotFoundError, IncompleteRequestError, AuthError } = require('../errors')

const ENV = process.env.NODE_ENV
const configVars = require('../server.config')[ENV]
const connectionString = configVars.mongoConnectionString

var controller = {}

controller.add = async (req, res) => {
    const { text, replyTo } = req.body
    let result = {}, status = 201
    var error = null
    const isReply = (replyTo !== undefined)
    try {
        if (!text) throw new IncompleteRequestError('Not all required parameters passed')
        await mongoose.connect(connectionString, { useNewUrlParser: true })
        const payload = req.decoded
        if (!payload || !payload.username) throw new AuthError('Insufficient privileges')
        const username = payload.username
        const curUser = await User.findOne({ username })
        if (!curUser) throw new UserNotFoundError('User not found')
        var repliedBit = await Bit.findById(replyTo)
        if (isReply && !repliedBit) throw new UserNotFoundError('Source bit not found')
        const newBit = new Bit({
            text,
            isReply,
            user: curUser._id,
            creationDate: new Date(),
            replyTo: isReply ? repliedBit._id : null,
            replyToUser: isReply ? repliedBit.user : null,
            replyCount: 0,
            likeCount: 0
        })
        await newBit.save()
        if (newBit.isReply) {
            repliedBit.replyCount += 1
            repliedBit.replies.push(newBit._id)
            await repliedBit.save()
        }
        result.result = newBit
    } catch (err) {
        error = err.toString()
        if (err instanceof AuthError) status = 401
        else if (err instanceof IncompleteRequestError) status = 400
        else if (err instanceof UserNotFoundError) status = 404
        else {
            console.log(error)
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