const { Pool } = require('pg');
require('dotenv').config();


class DatabaseManager {
    constructor() {
        this.createPool();
    }

    createPool() {
        this.pool = new Pool(
            {
                user: process.env.USER,
                host: process.env.HOST,
                database: process.env.DATABASE || 'blip_user_store',
                password: process.env.PASSWORD,
            });
    }

    getPool() {
        return this.pool;
    }

    async isAlive(){
        try {
            await this.pool.query('SELECT 1');
            return true;
        } catch (error) {
            console.log('Database connection is dead', error);
            return false;
        }
    }

    async reconnect() {
        try {
            console.log('reconnecting to the database.');
            await this.pool.end();

        } catch (error) {
            console.log('Error ending pool and cleaning up', error);
        }
        this.createPool();
    }

    async close(){
        try {
            await self.pool.end();
        } catch (error) {
            
        }
    }
}

const databaseManager = new DatabaseManager();
module.exports = { databaseManager };