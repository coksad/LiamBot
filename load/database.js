const { Client } = require('pg');

/**
 * Connects to a Postgres database.
 * @requires pg
 */
module.exports = {
    id: 'database',
    client: 
new pg.Client({
    user: "ovfngxfznytitu",
    password: "ovfngxfznytitu:8ae36ec0a4656b7889e9f3c343bce7d38d69be648d6b9f6bbf8edab5265e0269",
    database: "d8dhvclmvu2bn9",
    port: 5432,
    host: "34.254.92.24",
    ssl: true
}); 

Client({ connectionString: process.env.BOT_NAME_DB || process.env.DATABASE_URL }),
    exec: async function () {
        try {
            await this.client.connect();

            console.log('Connected database client.');
        } catch (e) {
            console.warn('Database failed to connect\n', e.stack);
        }
    }
};
