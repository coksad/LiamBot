const { Client } = require('pg');

/**
 * Connects to a Postgres database.
 * @requires pg
 */
module.exports = {
    id: 'database',
    client: 
new Client({
    user: "ovfngxfznytitu",
    password: "8ae36ec0a4656b7889e9f3c343bce7d38d69be648d6b9f6bbf8edab5265e0269",
    database: "d8dhvclmvu2bn9",
    port: 5432,
    host: "ec2-176-34-222-188.eu-west-1.compute.amazonaws.com",
    rejectUnauthorized: false }
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
