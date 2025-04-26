import {
  Configuration,
  Consumer,
  EQueueDeliveryModel,
  EQueueType,
  Producer,
  ProducibleMessage,
  Queue,
  QueueRateLimit,
} from "redis-smq";
import { ERedisConfigClient } from "redis-smq-common";

export const queueOps = async () => {
  console.log("before queue");

  const config = {
    redis: {
      client: ERedisConfigClient.IOREDIS,
      options: {
        host: "127.0.0.1",
        port: 6379,
      },
    },
  };

  Configuration.getSetConfig(config);

  const queue = new Queue();

  try {
    await new Promise((resolve, reject) => {
      queue.save(
        "testQ",
        EQueueType.FIFO_QUEUE,
        EQueueDeliveryModel.POINT_TO_POINT,
        (err) => {
          if (err) {
            if (err.name === "QueueQueueExistsError") {
              console.log("Queue already exists, continuing...");
              resolve(void 0);
            } else {
              reject(err);
            }
          } else {
            console.log("Queue created successfully");
            resolve(void 0);
          }
        }
      );
    });
  } catch (err) {
    console.error("Error creating queue:", err);
    throw err;
  }

  const rateLimit = new QueueRateLimit();
  await new Promise((resolve, reject) => {
    rateLimit.set("testQ", { limit: 10, interval: 30000 }, (err) => {
      if (err) {
        console.error("Error setting rate limit:", err);
        reject(err);
      } else {
        console.log("Rate limit set successfully: 10 messages per 30 seconds");
        resolve(void 0);
      }
    });
  });
  const producer = new Producer();

  await new Promise((resolve) => {
    producer.run(() => {
      console.log("Producer Started!");
      resolve(void 0);
    });
  });

  const intervalId = setInterval(() => {
    const msg = new ProducibleMessage();
    msg.setQueue("testQ").setBody(`hello from the QUEUE MFFF + ${Date.now()}`);

    producer.produce(msg, (err) => {
      if (err) {
        console.error("Error producing message:", err);
      } else {
        console.log("Message produced successfully");
      }
    });
  }, 1000);

  const consumer = new Consumer();

  await new Promise((resolve) => {
    consumer.run(() => {
      console.log("consumer started");
      resolve(void 0);
    });
  });

  consumer.consume(
    "testQ",
    (msg, cb) => {
      console.log("Received message:", msg.body);
      cb();
    },
    (err) => {
      if (err) console.error("Consumer error:", err);
    }
  );

  setTimeout(() => {
    console.log("Stopping message production after 30 seconds");
    clearInterval(intervalId);
  }, 30000);

  console.log("Queue operations running. Press Ctrl+C to exit.");
};
