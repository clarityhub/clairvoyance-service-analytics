const { connect } = require('service-claire/services/pubsub');
const {
  CHAT_CREATED,
  PARTICIPANT_JOINED,
} = require('service-claire/events');
const Mongo = require('../../services/Mongo');

const exchange = `${process.env.NODE_ENV || 'development'}.chats`;

const { addChatEvent } = require('../controllers/chat');

const subscribe = async function sub() {
  const connection = await connect;
  const ch = await connection.createChannel();

  ch.assertExchange(exchange, 'fanout', { durable: false });

  const q = await ch.assertQueue('', { exclusive: true });
  const ok = await ch.bindQueue(q.queue, exchange, '');

  ch.consume(q.queue, (msg) => {
    const message = JSON.parse(msg.content.toString());
    switch (message.event) {
      case CHAT_CREATED:
      case PARTICIPANT_JOINED: {
        return addChatEvent(message, {
          Mongo,
        });
      }
      default: {
        // Do nothing
        return {};
      }
    }
  }, { noAck: true });


  return ok;
};

module.exports = subscribe;
