const logger = require('service-claire/helpers/logger');

const addChatEvent = (message, { Mongo }) => {
  Mongo.then((db) => {
    db.collection('chats').insertOne({
      chatUuid: message.meta.clean.chatId || message.meta.clean.uuid,
      createdAt: +new Date(message.meta.clean.createdAt),
      accountId: message.meta.raw.accountId,
      event: message.event,
      message,
    });
  }).catch((err) => {
    logger.error(err);
  });
};

module.exports = {
  addChatEvent,
};
