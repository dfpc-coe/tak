import convert from 'xml-js';
import fs from 'fs/promises';

export default class TAKServerConfig {
    constructor(loc = '../../CoreConfig.xml') {
        this.loc = new URL(loc, import.meta.url);
    }

    async postgres(connection) {
        connection = new URL(connection);

        const config = convert.xml2js(await fs.readFile(this.loc), { compact: true, spaces: 4 });

        const conn = config.Configuration.repository.connection._attributes;

        conn.url = `jdbc:postgresql://${connection.host}${connection.pathname}`;
        conn.username = connection.username;
        conn.password = connection.password;

        await fs.writeFile(this.loc, convert.js2xml(config, {
            compact: true,
            spaces: 4
        }));
    }
}

