const controller = require('../../controllers/user')
const util = require('../../util')

module.exports = (router) => {
  router.route('/user')
    .post(controller.add)
    .get(util.validateToken, controller.getAll)

  router.route('/user/:username')
    .get(controller.info)

  router.route('/token')
    .post(controller.login)
}