const { Client } = require('pg');

/**
 * Connects to a Postgres database.
 * @requires pg
 */
module.exports = {
    id: 'database',
    client: new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }),
    exec: async function () {
        try {
            await this.client.connect();

            console.log('Connected database client.');
        } catch (e) {
            console.warn('Database failed to connect\n', e.stack);
        }
    }
}; 
