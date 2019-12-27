const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema

const bitSchema = new Schema({
    // user that created the bit
    user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    // date created in UTC
    creationDate: { type: Date, required: true },
    // the text of the bit
    text: { type: String, required: true },
    // is it a reply to a bit?
    isReply: { type: Boolean, required: true, default: false },
    // if so, store references to the bit and user it's in reply to
    replyTo: { type: Schema.Types.ObjectId, ref: 'Bit' },
    replyToUser: { type: Schema.Types.ObjectId, ref: 'User' },

    // more complex bit attributes

    // number and array of replies to this bit
    replyCount: { type: Number, required: true, default: 0 },
    replies: [
        { type: Schema.Types.ObjectId, ref: 'Bit' }
    ],
    // number and array of likes of this bit
    likeCount: { type: Number, required: true, default: 0 },
    likes: [
        { type: Schema.Types.ObjectId, ref: 'User' }
    ],

    tags: [
        { type: String }
    ],

    mentions: [
        {
            mentionText: String,
            reference: { type: Schema.Types.ObjectId, ref: 'User' }
        }
    ]

})

bitSchema.plugin(mongoosePaginate)

var Bit = mongoose.model('Bit', bitSchema)

module.exports = Bit