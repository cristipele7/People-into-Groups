import * as redis from 'redis';

let redisClient: any

export const getRedisClient = () => {
  return redisClient
}

export const connectRedis = async () => {
  redisClient = redis.createClient();
  redisClient.on("error", (error: any) => console.error(`Error redis : ${error?.message ?? error}`));
  await redisClient.connect();
};
