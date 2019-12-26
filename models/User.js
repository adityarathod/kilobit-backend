const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema

const ENV = process.env.NODE_ENV;
const configVars = require('../server.config')[ENV]

const userSchema = new Schema({
    displayName: { type: String, required: true, trim: true },
    username: { type: String, index: true, unique: true, trim: true },
    verified: { type: Boolean, required: true },
    numFollowers: { type: Number, required: true },
    following: { type: [Schema.Types.ObjectId], required: false },
    password: { type: String, required: true, trim: true },
    utcOffset: { type: Number, required: true },
    botUser: { type: Boolean, required: true },
    lastLogin: { type: Date, required: true },
    lastSeenClient: { type: String, required: true, default: 'kilobit web' }
})

userSchema.pre('save', function (next) {
    const curUser = this
    if (!curUser.isModified || !curUser.isNew) {
        next()
    } else {
        bcrypt.hash(curUser.password, configVars.saltingRounds, function (err, hash) {
            if (err) {
                console.log('Error hashing password for user', curUser.displayName)
                next(err)
            } else {
                curUser.password = hash
                next()
            }
        })
    }
})

var User = mongoose.model('User', userSchema)

module.exports = User