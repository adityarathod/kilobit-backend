const controller = require('../../controllers/bit')
const util = require('../../util')

module.exports = (router) => {
    router.route('/bit')
        .post(util.validateToken, controller.add)
    router.route('/bit/:user')
        .post(controller.getByUser)
}