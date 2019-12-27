const controller = require('../../controllers/bit')
const util = require('../../util')

module.exports = (router) => {
    router.route('/bit')
        .post(util.validateToken, controller.add)
    router.route('/bit/u/:user')
        .post(controller.getByUser)
    router.route('/bit/:id')
        .get(controller.getBitDetails)
}