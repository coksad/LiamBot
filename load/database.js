const { Client } = require('pg');

/**
 * Connects to a Postgres database.
 * @requires pg
 */
module.exports = {
    id: 'database',
    client: 
new Client({
    user: "cxulweweyzwkjy",
    password: "ccab7a9bd43c6af650855563c04241a6d3433cd947ce5c680f9844feb03421",
    database: "d8dhvclmvu2bn9",
    port: 5432,
    host: "ec2-176-34-222-188.eu-west-1.compute.amazonaws.com",
    ssl: { rejectUnauthorized: false }
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
