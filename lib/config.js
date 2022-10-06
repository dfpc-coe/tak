import AWS from 'aws-sdk';
import convert from 'xml-js';
import fs from 'fs/promises';

export default class TAKServerConfig {
    constructor(loc='../../CoreConfig.xml') {
        this.loc = new URL(loc, import.meta.url);
    }

    async postgres(connection) {
        connection = new URL(connection);

        const config = convert.xml2js(await fs.readFile(this.loc), { compact: true, spaces: 4 });

        const conn = config.Configuration.repository.connection._attributes;

        conn.url = `postgres://${connection.host}${connection.pathname}`;
        conn.username = connection.username;
        conn.password = connection.password;

        console.error(config.Configuration.repository.connection._attributes);

        await fs.writeFile(convert.js2xml(config, {
            compact: true,
            spaces: 4
        }), this.loc);
    }
}

