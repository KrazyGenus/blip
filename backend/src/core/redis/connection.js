// ../../core/redis/connection.js
const IORedis = require('ioredis');

class RedisClient {
    constructor() {
        this.connection = null;
        this.connectionReadyPromise = null; // This promise will resolve when Redis is truly ready
        this._initConnection(); // Initiate connection process on instantiation
    }

    _initConnection() {
        // Prevent re-initializing if already in progress
        if (this.connectionReadyPromise) {
            return;
        }

        console.log('RedisClient: Initializing IORedis connection...');
        this.connection = new IORedis({
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            maxRetriesPerRequest: null,
            lazyConnect: true,
        });

        // Create a promise that resolves when the connection is truly ready
        this.connectionReadyPromise = new Promise((resolve, reject) => {
            this.connection.on('ready', () => {
                console.log('RedisClient: IORedis connection is READY and authenticated!');
                resolve(this.connection);
            });

            this.connection.on('error', (err) => {
                console.error('RedisClient: IORedis Connection ERROR!', err);
                // Reject the promise and reset it on error so subsequent calls can retry
                this.connectionReadyPromise = null;
                reject(err);
            });

            this.connection.on('connect', () => {
                console.log('RedisClient: IORedis connection established (TCP connected, not yet ready).');
            });

            this.connection.on('close', () => {
                console.warn('RedisClient: IORedis connection closed.');
                this.connection = null;
                this.connectionReadyPromise = null; // Reset promise on close
            });

            // CRITICAL: Explicitly call connect() AFTER all listeners are set up.
            // This ensures the `ready` event is always caught by your promise.
            this.connection.connect().catch(err => {
                console.error("RedisClient: Initial connect() call failed (caught by promise):", err.message);
                this.connectionReadyPromise = null; // Reset promise on initial failure
                reject(err);
            });
        });
    }

    /**
     * Returns a Promise that resolves to the fully connected and ready IORedis instance.
     * Callers should `await` this method.
     */
    async getConnection() {
        if (!this.connectionReadyPromise) {
            // If connection process hasn't started or was reset, re-initiate
            this._initConnection();
        }
        return this.connectionReadyPromise;
    }

    async disconnect() {
        if (this.connection) {
            console.log('RedisClient: Disconnecting IORedis...');
            await this.connection.quit();
            this.connection = null;
            this.connectionReadyPromise = null;
            console.log('RedisClient: Disconnected.');
        }
    }
}

const redisClient = new RedisClient();
module.exports = { redisClient };