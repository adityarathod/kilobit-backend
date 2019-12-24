const mongoose = require('mongoose')
const crypto = require('crypto')
const Schema = mongoose.Schema

const userSchema = new Schema({
    displayName: { type: String, required: true },
    username: { type: String, index: true, unique: true },
    verified: { type: Boolean, required: true },
    numFollowers: { type: Number, required: true },
    following: { type: [Schema.Types.ObjectId], required: false },
    passwordHash: { type: Buffer, required: true },
    salt: { type: Buffer, required: true },
    utcOffset: { type: Number, required: true },
    botUser: { type: Boolean, required: true },
    lastSeenClient: { type: String, required: true, default: 'kilobit web' }
})


userSchema.methods.setPassword = function (pwd, cb) { 
    var salt = crypto.randomBytes(16)
    var key = crypto.pbkdf2Sync(pwd, salt, 100000, 64, 'sha512')
    this.salt = salt
    this.passwordHash = key
    return this.save(cb)
}

userSchema.methods.validatePassword = function (pwd) { 
    var salt = this.salt
    var key = crypto.pbkdf2Sync(pwd, salt, 100000, 64, 'sha512')
    return Buffer.compare(key, this.passwordHash) === 0
}

var User = mongoose.model('User', userSchema)

module.exports = User