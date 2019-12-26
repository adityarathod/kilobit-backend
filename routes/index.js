const user = require('./user')
const bit = require('./bit')

module.exports = (router) => {
  user(router)
  bit(router)
  return router
}