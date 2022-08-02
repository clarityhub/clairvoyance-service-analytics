const mongo = require('../src/services/Mongo');

module.exports = {
  up() {
    return mongo.then((db) => {
      db.collection('chats').ensureIndex({
        accountId: 1,
        createdAt: 1,
      }, {
        background: true,
        w: 1,
      });
    });
  },
  down() {
    return mongo.then((db) => {
      db.collection('chats').dropIndex('accountId_1_createdAt_1');
    });
  },
};
