const versionRouter = require('express-version-route');
const authMiddleware = require('service-claire/middleware/auth');
const makeMap = require('service-claire/helpers/makeMap');
const cors = require('cors');

const v1_0 = require('../v1_0/controllers/getChat');

const mongoMiddleware = require('../../middleware');

module.exports = (router) => {
  router.route('/chats')
    .options(cors())
    .get(
      cors(),
      authMiddleware,
      mongoMiddleware,
      versionRouter.route(makeMap({
        '1.0': v1_0.getWaitTimes,
        default: v1_0.getWaitTimes,
      }))
    );
};
