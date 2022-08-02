const mongo = require('../src/services/Mongo');

const mongoMiddleware = (req, res, next) => {
  if (!req.services) {
    req.services = {};
  }
  req.services.mongo = mongo;
  next();
};

module.exports = mongoMiddleware;
