const mongoose = require('mongoose')
const User = require('../models/User')

const connectionString = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PWD}@${process.env.MONGO_SERVER}/${process.env.MONGO_NAMESPACE}?retryWrites=true&w=majority`

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
                lastSeenClient: 'kilobit web'
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

module.exports = userController