const jwt = require('jsonwebtoken')

let util = {}

util.validateToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        res
            .status(401)
            .send({
                error: 'Authentication error - token required',
                status: 401
            })
    } else {
        try {
            const givenToken = req.headers.authorization.split(' ')[1]
            const opts = { expiresIn: '2d', issuer: 'https://kilobit.now.sh' }
            result = jwt.verify(givenToken, process.env.JWT_SECRET, opts)
            req.decoded = result
            next()
        } catch (e) {
            if (e instanceof jwt.JsonWebTokenError) { 
                res.status(401).send({
                    error: 'Authentication error - tampered/invalid token',
                    status: 401
                })
            } else {
                throw new Error(e)
            }
        }
    }
}

module.exports = util