const mongoose = require('mongoose')
const Bit = require('../models/Bit')
const User = require('../models/User')
const { UserNotFoundError, IncompleteRequestError, AuthError } = require('../errors')

var controller = {}

controller.add = async (req, res) => {
    const { text, replyTo } = req.body
    let result = {}, status = 201
    var error = null
    const isReply = (replyTo !== undefined)
    try {
        if (!text) throw new IncompleteRequestError('Not all required parameters passed')
        const payload = req.decoded
        if (!payload || !payload.username) throw new AuthError('Insufficient privileges')
        const username = payload.username
        const curUser = await User.findOne({ username })
        if (!curUser) throw new UserNotFoundError('User not found')
        var repliedBit = await Bit.findById(replyTo)
        if (isReply && !repliedBit) throw new UserNotFoundError('Source bit not found')
        let mentions = []
        var potentialMentions = text.match(/@\w+/g)
        if (potentialMentions) {
            for (var i = 0; i < potentialMentions.length; i++) {
                const username = potentialMentions[i].replace('@', '').trim()
                var user = await User.findOne({ username })
                if (!user) continue
                mentions.push({ mentionText: potentialMentions[i].trim(), refersTo: user._id })
            }
        }
        const potentialTags = text.match(/#\w+/g)
        var tags = []
        if (potentialTags) { 
            tags = potentialTags
        }
        // const tags = text.match(/#\w+/g).map(tag => tag.replace('#', ''))
        const newBit = new Bit({
            text,
            isReply,
            mentions,
            tags,
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

controller.getByUser = async (req, res) => {
    const { page } = req.body
    const username = req.params.user
    let result = {}, status = 200
    var error = null
    try {
        if (!username || !page) throw new IncompleteRequestError('Not all required parameters passed')
        const curUser = await User.findOne({ username })
        if (!curUser) throw new UserNotFoundError('User not found')
        var userBits = await Bit.paginate(
            { user: curUser._id },
            { sort: { creationDate: -1 }, limit: 10, page }
        )
        // var userBits = await Bit.find({ user: curUser._id })
        if (!userBits || userBits.docs.length === 0) throw new UserNotFoundError('No bits found')
        result.result = userBits
        result.result.username = username
    } catch (err) {
        error = err.toString()
        if (err instanceof IncompleteRequestError) status = 400
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

controller.getBitDetails = async (req, res) => {
    const { id: bitID } = req.params
    let result = {}, status = 200
    var error = null
    try {
        if (!bitID) throw new IncompleteRequestError('Not all required parameters passed')
        const foundBit = await Bit
            .findById(bitID)
            .populate({
                path: 'replies',
                populate: {
                    path: 'user',
                    select: '-password -utcOffset -lastLogin -userLevel -lastSeenClient -following -__v -_id',
                }
            })
            .populate('user', '-password -utcOffset -lastLogin -userLevel -lastSeenClient -following -__v -_id')
        if (!foundBit) throw new UserNotFoundError('Bit not found')
        result.result = foundBit
    } catch (err) {
        error = err.toString()
        if (err instanceof IncompleteRequestError) status = 400
        else if (err instanceof UserNotFoundError) status = 404
        else if (err instanceof mongoose.Error.CastError) {
            status = 400
            error = 'Invalid bit ID'
        }
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