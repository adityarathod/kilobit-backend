const controller = require('../../controllers/user')
const util = require('../../util')

module.exports = (router) => {
  router.route('/user')
    .post(controller.add)
    .get(util.validateToken, controller.getAll)

  router.route('/user/:username')
    .get(controller.info)

  router.route('/user/:username/feed')
  .get(util.validateToken, controller.feed)
  // .get(controller.feed)

  router.route('/token')
    .post(controller.login)
}