const controller = require('../../controllers/bit')
const util = require('../../util')

module.exports = (router) => {
    router.route('/user/:username/bits')
        .post(util.validateToken, controller.add)
        .get(controller.getByUser)
    router.route('/bit/:id')
        .get(controller.getBitDetails)
}