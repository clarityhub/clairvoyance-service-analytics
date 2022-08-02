const { ok, error } = require('service-claire/helpers/responses');
const moment = require('moment');
const logger = require('service-claire/helpers/logger');
const {
  CHAT_CREATED,
  PARTICIPANT_JOINED,
} = require('service-claire/events');

const BUCKETS = 5;
const HOUR = (60 * 60 * 1000);

const matchAndSort = (sortedArray) => {
  const now = +new Date();
  const leastValue = now - (BUCKETS * HOUR);
  const hashmap = {};
  const buckets = [];
  const unjoined = {
    total: 0,
    count: 0,
  };
  for (let b = 0; b < BUCKETS; b++) {
    buckets.push({
      total: 0,
      count: 0,
    });
  }
  // buckets: index 0 is oldest
  // bucket 5 is "now"

  sortedArray.reverse().forEach((record) => {
    const waitTime = now - record.createdAt;
    const adjustedTime = record.createdAt - leastValue;
    const bucketIndex = Math.trunc((adjustedTime) / HOUR);

    switch (record.event) {
      case PARTICIPANT_JOINED:
        hashmap[record.chatUuid] = {
          bucketIndex,
          event: record.event,
          adjustedTime,
          record,
        };
        break;
      case CHAT_CREATED:
      default: {
        // check if the event is in the same bucket as joined
        let joinedBucket = BUCKETS - 1;
        if (hashmap[record.chatUuid]) {
          // Add stuff to each bucket between the hash bucketIndex
          // and my current bucketIndex
          joinedBucket = hashmap[record.chatUuid].bucketIndex;

          buckets[joinedBucket].total += (
            hashmap[record.chatUuid].record.createdAt - record.createdAt
          );
          buckets[joinedBucket].count += 1;


          // Go back and add values to older buckets
          for (let j = bucketIndex; j < joinedBucket; j++) {
            // / how long have I been waiting: endOfBucketTime - createdAt
            // endOfBucketTime - createdAt
            buckets[j].total += (HOUR * (j + 1)) - adjustedTime;
            buckets[j].count += 1;
          }
        } else {
          // No matching event joined. Fill all buckets with the time from
          // when the event was created until now.
          hashmap[record.chatUuid] = {
            bucketIndex,
            event: record.event,
            adjustedTime,
            record,
          };
          unjoined.total += waitTime;
          unjoined.count += 1;

          for (let i = bucketIndex; i < BUCKETS; i++) {
            buckets[i].total += waitTime - (((BUCKETS - 1) - i) * HOUR);
            buckets[i].count += 1;
          }
        }
      }
    }
  });

  return [buckets, unjoined];
};

const getWaitTimes = async (req, res) => {
  try {
    const db = await req.services.mongo;
    const result = await db.collection('chats')
      .find({
        event: {
          $in: [PARTICIPANT_JOINED, CHAT_CREATED],
        },
        accountId: req.user.accountId,
        createdAt: {
          $gte: (moment().subtract(BUCKETS, 'hours').valueOf()),
        },
      })
      .sort({
        createdAt: 1,
      })
      .toArray();

    const [values, unjoined] = matchAndSort(result);

    const body = {
      buckets: values.reverse().map((v) => {
        return {
          totalRooms: v.count,
          avgTime: (v.total / Math.max(v.count, 1)),
        };
      }),
      unjoined: {
        totalRooms: unjoined.count,
        avgTime: (unjoined.total / Math.max(unjoined.count, 1)),
      },
    };

    return ok(res)(body);
  } catch (e) {
    logger.error(e);
    error(res)(e);
  }
};

module.exports = {
  getWaitTimes,
};
