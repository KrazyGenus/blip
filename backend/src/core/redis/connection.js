//Singleton Redis connection (using ioredis)
const IORedis = require('ioredis');


class RedisClient{
    constructor() {
        this.connection = new IORedis(
            {
                maxRetriesPerRequest: null,
                enableReadyCheck: false
            }
        );
    }

    getConnection() {
        return this.connection;
    }
}

const redisClient = new RedisClient();
module.exports = { redisClient }