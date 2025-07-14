const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(__dirname, './.env');
dotenv.config({ path: envPath });

module.exports = process.env;