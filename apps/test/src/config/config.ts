import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const config = {
    applicationUrl: process.env.APPLICATION_URL,
    username: process.env.USERNAME,
    password: process.env.PASSWORD
};

export default config;