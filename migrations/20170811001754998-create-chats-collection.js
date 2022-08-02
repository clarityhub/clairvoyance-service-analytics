const mongo = require('../src/services/Mongo');

module.exports = {
  up() {
    return mongo.then((db) => {
      db.createCollection('chat');
    });
  },
  down() {
    return mongo.then((db) => {
      db.collection('chat').drop();
    });
  },
};
